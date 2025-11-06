import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDigitalPurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class DigitalPurchasesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convert absolute file path to relative URL for static file serving
   * Handles both ImageKit URLs (returns as-is) and local file paths (converts to relative)
   */
  private convertFilePathToUrl(filePath: string): string | null {
    if (!filePath) {
      return null;
    }

    // If it's already an ImageKit URL or HTTP/HTTPS URL, return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    // If it's an absolute Windows path, convert to relative path
    if (filePath.includes('uploads')) {
      // Extract the relative path from the absolute path
      const uploadsIndex = filePath.indexOf('uploads');
      if (uploadsIndex !== -1) {
        const relativePath = filePath.substring(uploadsIndex + 'uploads'.length);
        // Remove leading slashes and normalize
        const normalizedPath = relativePath.replace(/^[\\/]+/, '').replace(/\\/g, '/');
        // Return as /images/... for static file serving
        return `/images/${normalizedPath}`;
      }
    }

    // If it's already a relative path starting with /images/, return as-is
    if (filePath.startsWith('/images/')) {
      return filePath;
    }

    // For other relative paths, assume they're in uploads
    return `/images/${filePath.replace(/^[\\/]+/, '').replace(/\\/g, '/')}`;
  }

  /**
   * Create a new digital purchase
   * @param buyerId - User ID of the person making the purchase (parent or student)
   * @param buyerType - Type of buyer (PARENT or STUDENT)
   * @param dto - Purchase data including beneficiaryStudentIds for parent purchases
   */
  async createPurchase(
    buyerId: string,
    buyerType: 'PARENT' | 'STUDENT',
    dto: CreateDigitalPurchaseDto,
  ) {
    // Get marketplace item with content
    const item = await this.prisma.marketplaceItem.findUnique({
      where: { id: dto.marketplaceItemId },
      include: {
        content: true,
        creator: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Marketplace item not found');
    }

    if (!item.content) {
      throw new BadRequestException(
        'Content not found for this marketplace item',
      );
    }

    // Check if content is digital
    if (item.content.contentType !== 'DIGITAL') {
      throw new BadRequestException('This item is not a digital product');
    }

    // Determine beneficiary student IDs
    let beneficiaryStudentIds: string[] = [];

    if (buyerType === 'PARENT') {
      // For parent purchases, use beneficiaryStudentIds from DTO
      if (!dto.beneficiaryStudentIds || dto.beneficiaryStudentIds.length === 0) {
        throw new BadRequestException(
          'Parent purchases must specify at least one beneficiary student.',
        );
      }

      // Validate that parent has relationship with all children
      const parent = await this.prisma.parent.findUnique({
        where: { userId: buyerId },
        include: {
          user: true,
        },
      });

      if (!parent) {
        throw new ForbiddenException('Parent not found');
      }

      // Check parent-student relationships
      // NOTE: parentUserId refers to Parent.id, not User.id
      console.log(`[DIGITAL PURCHASE] Checking relationships for Parent.id: ${parent.id}, Parent.userId: ${parent.userId}`);
      
      // First, try with Parent.id (correct way)
      let relationships = await this.prisma.parentSchoolRelationship.findMany({
        where: { parentUserId: parent.id, isActive: true },
        include: { children: true },
      });

      // Fallback: If no relationships found, check with User.id (for backward compatibility with old data)
      // This handles cases where relationships were incorrectly created with User IDs
      if (relationships.length === 0) {
        console.warn(`[DIGITAL PURCHASE] No relationships found with Parent.id, checking with User.id as fallback`);
        relationships = await this.prisma.parentSchoolRelationship.findMany({
          where: { parentUserId: parent.userId, isActive: true },
          include: { children: true },
        });
        if (relationships.length > 0) {
          console.warn(`[DIGITAL PURCHASE] WARNING: Found ${relationships.length} relationships with User.id instead of Parent.id - this is incorrect data`);
        }
      }

      console.log(`[DIGITAL PURCHASE] Found ${relationships.length} active parent-school relationships`);
      
      const validStudentIds = new Set<string>();
      relationships.forEach((rel) => {
        console.log(`[DIGITAL PURCHASE] Relationship ${rel.id} has ${rel.children.length} children`);
        rel.children.forEach((student) => {
          validStudentIds.add(student.id);
          console.log(`[DIGITAL PURCHASE] Added valid student ID: ${student.id}`);
        });
      });

      console.log(`[DIGITAL PURCHASE] Total valid student IDs: ${validStudentIds.size}`);
      console.log(`[DIGITAL PURCHASE] Valid student IDs:`, Array.from(validStudentIds));
      console.log(`[DIGITAL PURCHASE] Requested beneficiary student IDs:`, dto.beneficiaryStudentIds);

      // Validate all beneficiary students are children of this parent
      for (const studentId of dto.beneficiaryStudentIds) {
        if (!validStudentIds.has(studentId)) {
          console.error(`[DIGITAL PURCHASE] ERROR: Student ${studentId} not found in valid students list`);
          console.error(`[DIGITAL PURCHASE] Valid students were:`, Array.from(validStudentIds));
          throw new ForbiddenException(
            `Student ${studentId} is not linked to this parent account. Parent ID: ${parent.id}, Valid student IDs: ${Array.from(validStudentIds).join(', ') || 'none'}`,
          );
        }
      }

      beneficiaryStudentIds = dto.beneficiaryStudentIds;
    } else {
      // For student purchases, buyer is the beneficiary
      const student = await this.prisma.student.findUnique({
        where: { userId: buyerId },
      });

      if (!student) {
        throw new ForbiddenException('Student not found');
      }

      beneficiaryStudentIds = [student.id];
    }

    // Get creator's userId to check if creator is buying their own content
    const creator = await this.prisma.creator.findUnique({
      where: { id: item.creatorId },
      include: { user: true },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Prevent creator from buying their own content (unless buying for children)
    if (creator.userId === buyerId && buyerType === 'STUDENT') {
      throw new ForbiddenException(
        'Creators cannot purchase their own digital content for themselves',
      );
    }

    // Check for existing purchases and create purchase records
    const purchases: any[] = [];
    
    // Check if test mode is enabled (bypass payment)
    // Default to test mode in development (when NODE_ENV is not explicitly 'production')
    // Also check for explicit PAYMENT_TEST_MODE flag
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isTestMode = process.env.PAYMENT_TEST_MODE === 'true' || 
                      nodeEnv !== 'production';
    
    console.log('🔍 Payment Test Mode Check:', {
      PAYMENT_TEST_MODE: process.env.PAYMENT_TEST_MODE || 'not set',
      NODE_ENV: nodeEnv,
      isTestMode: isTestMode
    });
    
    if (isTestMode) {
      console.log('🧪 TEST MODE: Payment bypassed - purchases will be auto-completed');
    } else {
      console.log('⚠️ PRODUCTION MODE: Payment required - purchases will be PENDING until payment verification');
    }
    
    // In test mode, auto-complete purchases without payment reference
    const paymentStatus = (dto.paymentReference || isTestMode) ? 'COMPLETED' : 'PENDING';
    const completedAt = (dto.paymentReference || isTestMode) ? new Date() : null;
    const testPaymentReference = isTestMode && !dto.paymentReference 
      ? `TEST-${Date.now()}-${Math.random().toString(36).substring(7)}` 
      : dto.paymentReference;
    const testPaymentMethod = isTestMode && !dto.paymentMethod 
      ? 'TEST_MODE' 
      : (dto.paymentMethod || 'PENDING');

    for (const studentId of beneficiaryStudentIds) {
      // Check if already purchased
      const existingPurchase = await this.prisma.digitalPurchase.findFirst({
        where: {
          studentId,
          marketplaceItemId: dto.marketplaceItemId,
          status: 'COMPLETED',
        },
      });

      if (existingPurchase) {
        throw new BadRequestException(
          `Student ${studentId} has already purchased this content`,
        );
      }

      // Create purchase record
      const purchase = await this.prisma.digitalPurchase.create({
        data: {
          studentId,
          buyerId,
          buyerType: (buyerType === 'PARENT' ? 'PARENT' : 'STUDENT') as any,
          contentId: item.contentId!,
          marketplaceItemId: dto.marketplaceItemId,
          creatorId: item.creatorId,
          amount: item.price,
          currency: item.currency,
          paymentReference: testPaymentReference,
          paymentMethod: testPaymentMethod,
          status: paymentStatus,
          completedAt,
          giftMessage: buyerType === 'PARENT' ? dto.giftMessage : null,
        } as any,
        include: {
          content: {
            include: {
              files: true,
            },
          },
          marketplaceItem: true,
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        } as any,
      });

      purchases.push(purchase);
    }

    // Update marketplace item stats (only once per transaction)
    if (paymentStatus === 'COMPLETED') {
      const totalAmount = item.price * purchases.length;

      await this.prisma.marketplaceItem.update({
        where: { id: dto.marketplaceItemId },
        data: {
          totalSales: { increment: purchases.length },
          totalRevenue: { increment: totalAmount },
        },
      });

      // Update content stats
      await this.prisma.content.update({
        where: { id: item.contentId! },
        data: {
          salesCount: { increment: purchases.length },
        },
      });

      // Update creator stats
      await this.prisma.creator.update({
        where: { id: item.creatorId },
        data: {
          totalSales: { increment: purchases.length },
          totalRevenue: { increment: totalAmount },
        },
      });
    }

    // Return single purchase if one, array if multiple
    return purchases.length === 1 ? purchases[0] : purchases;
  }

  /**
   * Get student's digital library (all purchased content)
   * Returns all purchases regardless of status for history view
   */
  async getStudentLibrary(studentId: string) {
    const purchases = await this.prisma.digitalPurchase.findMany({
      where: {
        studentId,
        // Include all statuses for history view, not just COMPLETED
        // status: 'COMPLETED',
      },
      include: {
        content: {
          include: {
            files: true,
            contentCategory: true,
          },
        },
        marketplaceItem: true,
        creator: {
          include: {
            user: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
          },
        },
      } as any,
      orderBy: {
        purchasedAt: 'desc', // Use purchasedAt as primary sort since it always exists
      },
    });

    return purchases;
  }

  /**
   * Get parent's purchase history (purchases made for their children)
   * Returns all purchases regardless of status for history view
   */
  async getParentPurchases(parentUserId: string) {
    const purchases = await this.prisma.digitalPurchase.findMany({
      where: {
        buyerId: parentUserId,
        buyerType: 'PARENT' as any,
        // Include all statuses for history view, not just COMPLETED
      } as any,
      include: {
        content: {
          include: {
            files: true,
            contentCategory: true,
          },
        },
        marketplaceItem: true,
        creator: {
          include: {
            user: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    return purchases;
  }

  /**
   * Get download link for purchased content
   */
  async getDownloadLink(purchaseId: string, studentId: string) {
    const purchase = await this.prisma.digitalPurchase.findFirst({
      where: {
        id: purchaseId,
        studentId,
        status: 'COMPLETED',
      },
      include: {
        content: {
          include: {
            files: {
              where: {
                fileType: {
                  in: [
                    'DIGITAL_FILE',
                    'VIDEO_FILE',
                    'AUDIO_FILE',
                    'WORKSHEET_FILE',
                    'ASSIGNMENT_FILE',
                    'PAST_QUESTIONS_FILE',
                    'NOTES_FILE',
                    'INTERACTIVE_FILE',
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found or not completed');
    }

    // Update download count
    await this.prisma.digitalPurchase.update({
      where: { id: purchaseId },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });

    // Update content download count
    await this.prisma.content.update({
      where: { id: purchase.contentId },
      data: {
        downloadCount: { increment: 1 },
      },
    });

    // Convert file paths to accessible URLs
    // Priority: ImageKit URL (for new uploads) > Local file path conversion (for legacy content)
    if (purchase.content?.files && purchase.content.files.length > 0) {
      purchase.content.files = purchase.content.files.map((file: any) => {
        const convertedPath = file.storagePath ? this.convertFilePathToUrl(file.storagePath) : null;
        return {
          ...file,
          downloadUrl: file.imageKitUrl 
            ? file.imageKitUrl  // Use ImageKit URL directly for new uploads
            : (convertedPath || file.storagePath), // Convert local paths for legacy content
          streamingUrl: file.imageKitUrl 
            ? file.imageKitUrl  // Use ImageKit URL directly for new uploads
            : (convertedPath || file.storagePath), // Convert local paths for legacy content
        };
      });
    }

    return purchase;
  }

  /**
   * Get streaming link for purchased content
   */
  async getStreamLink(purchaseId: string, studentId: string) {
    const purchase = await this.prisma.digitalPurchase.findFirst({
      where: {
        id: purchaseId,
        studentId,
        status: 'COMPLETED',
      },
      include: {
        content: {
          include: {
            files: {
              where: {
                fileType: {
                  in: [
                    'DIGITAL_FILE',
                    'VIDEO_FILE',
                    'AUDIO_FILE',
                    'WORKSHEET_FILE',
                    'ASSIGNMENT_FILE',
                    'PAST_QUESTIONS_FILE',
                    'NOTES_FILE',
                    'INTERACTIVE_FILE',
                  ],
                },
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found or not completed');
    }

    // Update stream count
    await this.prisma.digitalPurchase.update({
      where: { id: purchaseId },
      data: {
        streamCount: { increment: 1 },
        lastStreamedAt: new Date(),
      },
    });

    // Update content stream count
    await this.prisma.content.update({
      where: { id: purchase.contentId },
      data: {
        streamCount: { increment: 1 },
      },
    });

    return purchase;
  }

  /**
   * Verify if student has access to content
   */
  async hasAccess(studentId: string, contentId: string): Promise<boolean> {
    const purchase = await this.prisma.digitalPurchase.findFirst({
      where: {
        studentId,
        contentId,
        status: 'COMPLETED',
      },
    });

    return !!purchase;
  }

  /**
   * Verify payment and mark purchase(s) as COMPLETED
   */
  async verifyPayment(
    buyerId: string,
    purchaseId: string,
    paymentReference: string,
    paymentMethod?: string,
  ) {
    // Find the purchase
    const purchase = await this.prisma.digitalPurchase.findUnique({
      where: { id: purchaseId },
      include: {
        marketplaceItem: true,
        content: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Verify buyer owns this purchase
    if (purchase.buyerId !== buyerId) {
      throw new ForbiddenException('You do not have permission to verify this purchase');
    }

    // If already completed, return as is
    if (purchase.status === 'COMPLETED') {
      return purchase;
    }

    // Update purchase status
    const updatedPurchase = await this.prisma.digitalPurchase.update({
      where: { id: purchaseId },
      data: {
        status: 'COMPLETED',
        paymentReference,
        paymentMethod: paymentMethod || 'PAYMENT_GATEWAY',
        completedAt: new Date(),
      },
      include: {
        content: {
          include: {
            files: true,
            contentCategory: true,
          },
        },
        marketplaceItem: true,
        creator: {
          include: {
            user: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            type: true,
          },
        },
      } as any,
    });

    // Update marketplace item stats (only once per purchase)
    await this.prisma.marketplaceItem.update({
      where: { id: purchase.marketplaceItemId },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: purchase.amount },
      },
    });

    // Update content stats
    await this.prisma.content.update({
      where: { id: purchase.contentId },
      data: {
        salesCount: { increment: 1 },
      },
    });

    // Update creator stats
    await this.prisma.creator.update({
      where: { id: purchase.creatorId },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: purchase.amount },
      },
    });

    return updatedPurchase;
  }

  /**
   * Get a specific child's library (for parent viewing)
   */
  async getChildLibrary(parentUserId: string, studentId: string) {
    // Verify parent has relationship with this student
    const relationships = await this.prisma.parentSchoolRelationship.findMany({
      where: { parentUserId, isActive: true },
      include: { children: true },
    });

    const validStudentIds = new Set<string>();
    relationships.forEach((rel) => {
      rel.children.forEach((student) => {
        validStudentIds.add(student.id);
      });
    });

    if (!validStudentIds.has(studentId)) {
      throw new ForbiddenException(
        'You do not have permission to view this student\'s library',
      );
    }

    // Return student's library
    return this.getStudentLibrary(studentId);
  }
}
