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
      const relationships = await this.prisma.parentSchoolRelationship.findMany({
        where: { parentUserId: buyerId, isActive: true },
        include: { children: true },
      });

      const validStudentIds = new Set<string>();
      relationships.forEach((rel) => {
        rel.children.forEach((student) => {
          validStudentIds.add(student.id);
        });
      });

      // Validate all beneficiary students are children of this parent
      for (const studentId of dto.beneficiaryStudentIds) {
        if (!validStudentIds.has(studentId)) {
          throw new ForbiddenException(
            `Student ${studentId} is not linked to this parent account`,
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
    const paymentStatus = dto.paymentReference ? 'COMPLETED' : 'PENDING';
    const completedAt = dto.paymentReference ? new Date() : null;

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
          paymentReference: dto.paymentReference,
          paymentMethod: dto.paymentMethod || 'PENDING',
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
   */
  async getStudentLibrary(studentId: string) {
    const purchases = await this.prisma.digitalPurchase.findMany({
      where: {
        studentId,
        status: 'COMPLETED',
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
        completedAt: 'desc',
      },
    });

    return purchases;
  }

  /**
   * Get parent's purchase history (purchases made for their children)
   */
  async getParentPurchases(parentUserId: string) {
    const purchases = await this.prisma.digitalPurchase.findMany({
      where: {
        buyerId: parentUserId,
        buyerType: 'PARENT' as any,
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
}
