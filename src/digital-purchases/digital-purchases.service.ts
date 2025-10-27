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
   */
  async createPurchase(studentId: string, dto: CreateDigitalPurchaseDto) {
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

    // Check if already purchased
    const existingPurchase = await this.prisma.digitalPurchase.findFirst({
      where: {
        studentId,
        marketplaceItemId: dto.marketplaceItemId,
        status: 'COMPLETED',
      },
    });

    if (existingPurchase) {
      throw new BadRequestException('You have already purchased this content');
    }

    // Prevent creator from buying their own content
    if (item.creatorId === studentId) {
      throw new ForbiddenException(
        'Creators cannot purchase their own digital content',
      );
    }

    // Create purchase
    const purchase = await this.prisma.digitalPurchase.create({
      data: {
        studentId,
        contentId: item.contentId!,
        marketplaceItemId: dto.marketplaceItemId,
        creatorId: item.creatorId,
        amount: item.price,
        currency: item.currency,
        paymentReference: dto.paymentReference,
        paymentMethod: dto.paymentMethod || 'PENDING',
        status: dto.paymentReference ? 'COMPLETED' : 'PENDING', // If payment ref provided, mark as completed
        completedAt: dto.paymentReference ? new Date() : null,
      },
      include: {
        content: {
          include: {
            files: true,
          },
        },
        marketplaceItem: true,
      },
    });

    // Update marketplace item stats
    if (purchase.status === 'COMPLETED') {
      await this.prisma.marketplaceItem.update({
        where: { id: dto.marketplaceItemId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: item.price },
        },
      });

      // Update content stats
      await this.prisma.content.update({
        where: { id: item.contentId! },
        data: {
          salesCount: { increment: 1 },
        },
      });

      // Update creator stats
      await this.prisma.creator.update({
        where: { id: item.creatorId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: item.price },
        },
      });
    }

    return purchase;
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
      },
      orderBy: {
        completedAt: 'desc',
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
