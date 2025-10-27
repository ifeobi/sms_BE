"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CreatorHistoryService = class CreatorHistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCreatorHistory(creatorId, params) {
        const where = {
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
    async getHistoryAnalytics(creatorId, params) {
        const where = {
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
        const totalContent = content.length;
        const totalPurchases = content.reduce((sum, item) => sum + (item.digitalPurchases?.length || 0), 0);
        const totalDownloads = content.reduce((sum, item) => sum + (item.digitalPurchases?.reduce((purchaseSum, purchase) => purchaseSum + purchase.downloadCount, 0) || 0), 0);
        const totalStreams = content.reduce((sum, item) => sum + (item.digitalPurchases?.reduce((purchaseSum, purchase) => purchaseSum + purchase.streamCount, 0) || 0), 0);
        const totalRevenue = content.reduce((sum, item) => sum + (item.digitalPurchases?.reduce((purchaseSum, purchase) => purchaseSum + purchase.amount, 0) || 0), 0);
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
        }, {});
        return {
            totalContent,
            totalPurchases,
            totalDownloads,
            totalStreams,
            totalRevenue,
            averageRevenuePerContent: totalContent > 0 ? totalRevenue / totalContent : 0,
            monthlyTimeline: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
        };
    }
    async unpublishFromMarketplace(creatorId, contentId) {
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
            throw new common_1.NotFoundException('Content not found or not published to marketplace');
        }
        const updatedContent = await this.prisma.content.update({
            where: { id: contentId },
            data: {
                marketplaceUnpublishedAt: new Date(),
                status: 'PUBLISHED',
            },
        });
        await this.prisma.marketplaceItem.deleteMany({
            where: { contentId },
        });
        return updatedContent;
    }
    async getContentPerformance(creatorId, contentId) {
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
            throw new common_1.NotFoundException('Content not found');
        }
        return content;
    }
};
exports.CreatorHistoryService = CreatorHistoryService;
exports.CreatorHistoryService = CreatorHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreatorHistoryService);
//# sourceMappingURL=creator-history.service.js.map