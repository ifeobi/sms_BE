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
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RatingsService = class RatingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrUpdateRating(userId, createRatingDto) {
        const { rating, review, marketplaceItemId } = createRatingDto;
        const marketplaceItem = await this.prisma.marketplaceItem.findUnique({
            where: { id: marketplaceItemId },
        });
        if (!marketplaceItem) {
            throw new common_1.NotFoundException('Marketplace item not found');
        }
        const existingRating = await this.prisma.productRating.findUnique({
            where: {
                userId_marketplaceItemId: {
                    userId,
                    marketplaceItemId,
                },
            },
        });
        let productRating;
        if (existingRating) {
            productRating = await this.prisma.productRating.update({
                where: { id: existingRating.id },
                data: {
                    rating,
                    review,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            productRating = await this.prisma.productRating.create({
                data: {
                    rating,
                    review,
                    userId,
                    marketplaceItemId,
                    isVerified: false,
                },
            });
        }
        await this.updateMarketplaceItemRatings(marketplaceItemId);
        return productRating;
    }
    async getRatingsForMarketplaceItem(marketplaceItemId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [ratings, total] = await Promise.all([
            this.prisma.productRating.findMany({
                where: { marketplaceItemId },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.productRating.count({
                where: { marketplaceItemId },
            }),
        ]);
        return {
            ratings,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getStudentRating(userId, marketplaceItemId) {
        return this.prisma.productRating.findUnique({
            where: {
                userId_marketplaceItemId: {
                    userId,
                    marketplaceItemId,
                },
            },
        });
    }
    async deleteRating(userId, ratingId) {
        const rating = await this.prisma.productRating.findUnique({
            where: { id: ratingId },
        });
        if (!rating) {
            throw new common_1.NotFoundException('Rating not found');
        }
        if (rating.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own ratings');
        }
        await this.prisma.productRating.delete({
            where: { id: ratingId },
        });
        await this.updateMarketplaceItemRatings(rating.marketplaceItemId);
        return { message: 'Rating deleted successfully' };
    }
    async getRatingStatistics(marketplaceItemId) {
        const stats = await this.prisma.productRating.aggregate({
            where: { marketplaceItemId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        const distribution = await Promise.all([1, 2, 3, 4, 5].map(async (star) => {
            const count = await this.prisma.productRating.count({
                where: {
                    marketplaceItemId,
                    rating: star,
                },
            });
            return { stars: star, count };
        }));
        return {
            averageRating: stats._avg.rating || 0,
            totalRatings: stats._count.rating || 0,
            distribution,
        };
    }
    async updateMarketplaceItemRatings(marketplaceItemId) {
        const stats = await this.prisma.productRating.aggregate({
            where: { marketplaceItemId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await this.prisma.marketplaceItem.update({
            where: { id: marketplaceItemId },
            data: {
                rating: stats._avg.rating || 0,
                totalRatings: stats._count.rating || 0,
            },
        });
    }
    async markRatingAsVerified(userId, marketplaceItemId) {
        const rating = await this.prisma.productRating.findUnique({
            where: {
                userId_marketplaceItemId: {
                    userId,
                    marketplaceItemId,
                },
            },
        });
        if (rating) {
            await this.prisma.productRating.update({
                where: { id: rating.id },
                data: { isVerified: true },
            });
        }
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map