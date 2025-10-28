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
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const marketplace_service_1 = require("./marketplace.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const content_service_1 = require("../content/content.service");
let MarketplaceController = class MarketplaceController {
    marketplaceService;
    contentService;
    constructor(marketplaceService, contentService) {
        this.marketplaceService = marketplaceService;
        this.contentService = contentService;
    }
    async getMarketplaceItems(skip, take, category, search) {
        return this.marketplaceService.getMarketplaceItems({
            skip,
            take,
            category,
            search,
        });
    }
    async getMarketplaceItem(id) {
        return this.marketplaceService.getMarketplaceItemById(id);
    }
    async publishToMarketplace(contentId, req) {
        let creatorId = req.user.creatorId;
        if (!creatorId) {
            const creator = await this.contentService.findCreatorByUserId(req.user.id);
            if (creator) {
                creatorId = creator.id;
            }
        }
        if (!creatorId) {
            throw new common_1.BadRequestException('Creator account not found for this user');
        }
        return this.marketplaceService.publishToMarketplace(contentId, creatorId);
    }
    async unpublishFromMarketplace(contentId, req) {
        let creatorId = req.user.creatorId;
        if (!creatorId) {
            const creator = await this.contentService.findCreatorByUserId(req.user.id);
            if (creator) {
                creatorId = creator.id;
            }
        }
        if (!creatorId) {
            throw new common_1.BadRequestException('Creator account not found for this user');
        }
        return this.marketplaceService.unpublishFromMarketplace(contentId, creatorId);
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('skip', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('take', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getMarketplaceItems", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getMarketplaceItem", null);
__decorate([
    (0, common_1.Post)('publish/:contentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "publishToMarketplace", null);
__decorate([
    (0, common_1.Delete)('unpublish/:contentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "unpublishFromMarketplace", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, common_1.Controller)('marketplace'),
    __metadata("design:paramtypes", [marketplace_service_1.MarketplaceService,
        content_service_1.ContentService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map