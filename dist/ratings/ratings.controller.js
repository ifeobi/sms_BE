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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingsController = void 0;
const common_1 = require("@nestjs/common");
const ratings_service_1 = require("./ratings.service");
const create_rating_dto_1 = require("./dto/create-rating.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let RatingsController = class RatingsController {
    ratingsService;
    prisma;
    constructor(ratingsService, prisma) {
        this.ratingsService = ratingsService;
        this.prisma = prisma;
    }
    async getUserId(userId) {
        return userId;
    }
    async createRating(req, createRatingDto) {
        const userId = await this.getUserId(req.user.id);
        return this.ratingsService.createOrUpdateRating(userId, createRatingDto);
    }
    async updateRating(req, ratingId, updateRatingDto) {
        const userId = await this.getUserId(req.user.id);
        const existingRating = await this.prisma.productRating.findUnique({
            where: { id: ratingId },
        });
        if (!existingRating) {
            throw new Error('Rating not found');
        }
        if (existingRating.userId !== userId) {
            throw new Error('You can only update your own ratings');
        }
        const createRatingDto = {
            rating: updateRatingDto.rating,
            review: updateRatingDto.review,
            marketplaceItemId: existingRating.marketplaceItemId,
        };
        return this.ratingsService.createOrUpdateRating(userId, createRatingDto);
    }
    async getRatingsForMarketplaceItem(marketplaceItemId, page, limit) {
        return this.ratingsService.getRatingsForMarketplaceItem(marketplaceItemId, page, limit);
    }
    async getRatingStatistics(marketplaceItemId) {
        return this.ratingsService.getRatingStatistics(marketplaceItemId);
    }
    async getMyRating(req, marketplaceItemId) {
        const userId = await this.getUserId(req.user.id);
        return this.ratingsService.getStudentRating(userId, marketplaceItemId);
    }
    async deleteRating(req, ratingId) {
        const userId = await this.getUserId(req.user.id);
        return this.ratingsService.deleteRating(userId, ratingId);
    }
    async getMyRatings(req, page, limit) {
        const userId = await this.getUserId(req.user.id);
        const skip = (page - 1) * limit;
        const [ratings, total] = await Promise.all([
            this.prisma.productRating.findMany({
                where: { userId: userId },
                include: {
                    marketplaceItem: {
                        select: {
                            id: true,
                            title: true,
                            thumbnailUrl: true,
                            price: true,
                            currency: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.productRating.count({
                where: { userId: userId },
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
};
exports.RatingsController = RatingsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_rating_dto_1.CreateRatingDto]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "createRating", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_rating_dto_1.UpdateRatingDto]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "updateRating", null);
__decorate([
    (0, common_1.Get)('marketplace-item/:marketplaceItemId'),
    __param(0, (0, common_1.Param)('marketplaceItemId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getRatingsForMarketplaceItem", null);
__decorate([
    (0, common_1.Get)('marketplace-item/:marketplaceItemId/statistics'),
    __param(0, (0, common_1.Param)('marketplaceItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getRatingStatistics", null);
__decorate([
    (0, common_1.Get)('marketplace-item/:marketplaceItemId/my-rating'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('marketplaceItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getMyRating", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "deleteRating", null);
__decorate([
    (0, common_1.Get)('my-ratings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], RatingsController.prototype, "getMyRatings", null);
exports.RatingsController = RatingsController = __decorate([
    (0, common_1.Controller)('ratings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ratings_service_1.RatingsService,
        prisma_service_1.PrismaService])
], RatingsController);
//# sourceMappingURL=ratings.controller.js.map