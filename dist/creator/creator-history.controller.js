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
exports.CreatorHistoryController = void 0;
const common_1 = require("@nestjs/common");
const creator_history_service_1 = require("./creator-history.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const swagger_1 = require("@nestjs/swagger");
let CreatorHistoryController = class CreatorHistoryController {
    historyService;
    prisma;
    constructor(historyService, prisma) {
        this.historyService = historyService;
        this.prisma = prisma;
    }
    async getHistory(req, skip, take, startDate, endDate, contentType) {
        const creatorId = req.user.creatorId || req.user.id;
        const params = {
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            contentType,
        };
        return this.historyService.getCreatorHistory(creatorId, params);
    }
    async getAnalytics(req, startDate, endDate) {
        const creatorId = req.user.creatorId || req.user.id;
        const params = {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        return this.historyService.getHistoryAnalytics(creatorId, params);
    }
    async getContentPerformance(req, contentId) {
        const creatorId = req.user.creatorId || req.user.id;
        return this.historyService.getContentPerformance(creatorId, contentId);
    }
    async unpublishContent(req, contentId) {
        const creatorId = req.user.creatorId || req.user.id;
        return this.historyService.unpublishFromMarketplace(creatorId, contentId);
    }
};
exports.CreatorHistoryController = CreatorHistoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get creator content history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Content history retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number, description: 'Number of items to skip' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number, description: 'Number of items to take' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Start date filter (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'End date filter (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'contentType', required: false, type: String, description: 'Content type filter' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('contentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], CreatorHistoryController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get creator history analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Start date filter (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'End date filter (ISO string)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CreatorHistoryController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)(':contentId/performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get content performance details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance details retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CreatorHistoryController.prototype, "getContentPerformance", null);
__decorate([
    (0, common_1.Delete)(':contentId/unpublish'),
    (0, swagger_1.ApiOperation)({ summary: 'Unpublish content from marketplace' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Content unpublished successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CreatorHistoryController.prototype, "unpublishContent", null);
exports.CreatorHistoryController = CreatorHistoryController = __decorate([
    (0, swagger_1.ApiTags)('Creator History'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('creator/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [creator_history_service_1.CreatorHistoryService,
        prisma_service_1.PrismaService])
], CreatorHistoryController);
//# sourceMappingURL=creator-history.controller.js.map