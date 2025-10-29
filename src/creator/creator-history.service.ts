import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreatorHistoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get creator's content history (published to marketplace)
   */
  async getCreatorHistory(creatorId: string, params?: {
    skip?: number;
    take?: number;
    startDate?: Date;
    endDate?: Date;
    contentType?: string;
  }) {
    const where: any = {
      creatorId,
      OR: [
        { marketplacePublishedAt: { not: null } },
        { 
          marketplaceItem: { 
            isNot: null 
          } 
        }
      ],
    };

    // Add date range filter
    if (params?.startDate || params?.endDate) {
      where.AND = [
        {
          OR: [
            { marketplacePublishedAt: { not: null } },
            { 
              marketplaceItem: { 
                isNot: null 
              } 
            }
          ]
        },
        {
          OR: [
            {
              marketplacePublishedAt: {
                gte: params.startDate,
                lte: params.endDate,
              }
            },
            {
              marketplaceItem: {
                isNot: null
              }
            }
          ]
        }
      ];
    }

    // Add content type filter
    if (params?.contentType) {
      where.contentCategory = {
        name: params.contentType,
      };
    }

    const content = await this.prisma.content.findMany({
      where,
      include: {
        contentCategory: true,
        subjectCategory: true,
        files: {
          where: {
            fileType: 'DIGITAL_FILE',
          },
        },
        digitalPurchases: {
          select: {
            id: true,
            purchasedAt: true,
            amount: true,
            currency: true,
            downloadCount: true,
            streamCount: true,
            student: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        marketplaceItem: {
          select: {
            id: true,
            price: true,
            currency: true,
            totalSales: true,
            totalRevenue: true,
          },
        },
      },
      orderBy: {
        marketplacePublishedAt: 'desc',
      },
      skip: params?.skip || 0,
      take: params?.take || 20,
    });

    // Calculate additional metrics
    const contentWithMetrics = content.map(item => {
      const totalPurchases = item.digitalPurchases?.length || 0;
      const totalDownloads = item.digitalPurchases?.reduce((sum, purchase) => sum + purchase.downloadCount, 0) || 0;
      const totalStreams = item.digitalPurchases?.reduce((sum, purchase) => sum + purchase.streamCount, 0) || 0;
      const totalRevenue = item.digitalPurchases?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;

      return {
        ...item,
        metrics: {
          totalPurchases,
          totalDownloads,
          totalStreams,
          totalRevenue,
          averageRating: item.ratingAverage,
          reviewCount: item.reviewCount,
        },
      };
    });

    return contentWithMetrics;
  }

  /**
   * Get history analytics for creator
   */
  async getHistoryAnalytics(creatorId: string, params?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {
      creatorId,
      OR: [
        { marketplacePublishedAt: { not: null } },
        { 
          marketplaceItem: { 
            isNot: null 
          } 
        }
      ],
    };

    if (params?.startDate || params?.endDate) {
      where.AND = [
        {
          OR: [
            { marketplacePublishedAt: { not: null } },
            { 
              marketplaceItem: { 
                isNot: null 
              } 
            }
          ]
        },
        {
          OR: [
            {
              marketplacePublishedAt: {
                gte: params.startDate,
                lte: params.endDate,
              }
            },
            {
              marketplaceItem: {
                isNot: null
              }
            }
          ]
        }
      ];
    }

    const content = await this.prisma.content.findMany({
      where,
      include: {
        digitalPurchases: {
          select: {
            amount: true,
            downloadCount: true,
            streamCount: true,
            purchasedAt: true,
          },
        },
      },
    });

    // Calculate analytics
    const totalContent = content.length;
    const totalPurchases = content.reduce((sum, item) => sum + (item.digitalPurchases?.length || 0), 0);
    const totalDownloads = content.reduce((sum, item) => 
      sum + (item.digitalPurchases?.reduce((purchaseSum, purchase) => purchaseSum + purchase.downloadCount, 0) || 0), 0);
    const totalStreams = content.reduce((sum, item) => 
      sum + (item.digitalPurchases?.reduce((purchaseSum, purchase) => purchaseSum + purchase.streamCount, 0) || 0), 0);
    const totalRevenue = content.reduce((sum, item) => 
      sum + (item.digitalPurchases?.reduce((purchaseSum, purchase) => purchaseSum + purchase.amount, 0) || 0), 0);

    // Group by month for timeline
    const monthlyData = content.reduce((acc, item) => {
      if (item.marketplacePublishedAt) {
        const month = item.marketplacePublishedAt.toISOString().substring(0, 7);
        if (!acc[month]) {
          acc[month] = {
            month,
            contentCount: 0,
            purchases: 0,
            revenue: 0,
          };
        }
        acc[month].contentCount += 1;
        acc[month].purchases += item.digitalPurchases?.length || 0;
        acc[month].revenue += item.digitalPurchases?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      totalContent,
      totalPurchases,
      totalDownloads,
      totalStreams,
      totalRevenue,
      averageRevenuePerContent: totalContent > 0 ? totalRevenue / totalContent : 0,
      monthlyTimeline: Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month)),
    };
  }

  /**
   * Unpublish content from marketplace
   */
  async unpublishFromMarketplace(creatorId: string, contentId: string) {
    // Verify content belongs to creator and is in marketplace
    const content = await this.prisma.content.findFirst({
      where: {
        id: contentId,
        creatorId,
        OR: [
          { marketplacePublishedAt: { not: null } },
          { 
            marketplaceItem: { 
              isNot: null 
            } 
          }
        ],
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found or not published to marketplace');
    }

    // Update content to mark as unpublished
    const updatedContent = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        marketplaceUnpublishedAt: new Date(),
        status: 'PUBLISHED', // Keep as published but not in marketplace
      },
    });

    // Remove from marketplace item if exists
    await this.prisma.marketplaceItem.deleteMany({
      where: { contentId },
    });

    return updatedContent;
  }

  /**
   * Get content performance details
   */
  async getContentPerformance(creatorId: string, contentId: string) {
    const content = await this.prisma.content.findFirst({
      where: {
        id: contentId,
        creatorId,
        OR: [
          { marketplacePublishedAt: { not: null } },
          { 
            marketplaceItem: { 
              isNot: null 
            } 
          }
        ],
      },
      include: {
        digitalPurchases: {
          include: {
            student: {
              select: {
                user: {
                  select: {
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
        },
        marketplaceItem: true,
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content;
  }
}
