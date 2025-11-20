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
exports.DigitalPurchasesController = void 0;
const common_1 = require("@nestjs/common");
const digital_purchases_service_1 = require("./digital-purchases.service");
const streaming_service_1 = require("./streaming.service");
const create_purchase_dto_1 = require("./dto/create-purchase.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let DigitalPurchasesController = class DigitalPurchasesController {
    digitalPurchasesService;
    streamingService;
    prisma;
    constructor(digitalPurchasesService, streamingService, prisma) {
        this.digitalPurchasesService = digitalPurchasesService;
        this.streamingService = streamingService;
        this.prisma = prisma;
    }
    async getBuyerInfo(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
        });
        if (student) {
            return {
                buyerId: userId,
                buyerType: 'STUDENT',
            };
        }
        const parent = await this.prisma.parent.findUnique({
            where: { userId },
        });
        if (parent) {
            return {
                buyerId: userId,
                buyerType: 'PARENT',
            };
        }
        throw new common_1.ForbiddenException('Only students and parents can purchase digital content');
    }
    async getStudentId(userId) {
        const student = await this.prisma.student.findUnique({
            where: { userId },
        });
        if (!student) {
            throw new common_1.ForbiddenException('Only students can access this resource');
        }
        return student.id;
    }
    async createPurchase(req, createPurchaseDto) {
        const { buyerId, buyerType } = await this.getBuyerInfo(req.user.id);
        return this.digitalPurchasesService.createPurchase(buyerId, buyerType, createPurchaseDto);
    }
    async getMyLibrary(req) {
        const student = await this.prisma.student.findUnique({
            where: { userId: req.user.id },
        });
        if (student) {
            return this.digitalPurchasesService.getStudentLibrary(student.id);
        }
        const parent = await this.prisma.parent.findUnique({
            where: { userId: req.user.id },
        });
        if (parent) {
            return this.digitalPurchasesService.getParentPurchases(req.user.id);
        }
        throw new common_1.ForbiddenException('Only students and parents can access this resource');
    }
    async getDownloadLink(req, purchaseId) {
        const studentId = await this.getStudentId(req.user.id);
        return this.digitalPurchasesService.getDownloadLink(purchaseId, studentId);
    }
    async getStreamLink(req, purchaseId, quality = 'medium') {
        const studentId = await this.getStudentId(req.user.id);
        return this.streamingService.getStreamingUrl(purchaseId, studentId, quality);
    }
    async getStreamingAnalytics(contentId) {
        return this.streamingService.getStreamingAnalytics(contentId);
    }
    async hasAccess(req, contentId) {
        try {
            const studentId = await this.getStudentId(req.user.id);
            const hasAccess = await this.digitalPurchasesService.hasAccess(studentId, contentId);
            return { hasAccess };
        }
        catch {
            return { hasAccess: false };
        }
    }
};
exports.DigitalPurchasesController = DigitalPurchasesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_purchase_dto_1.CreateDigitalPurchaseDto]),
    __metadata("design:returntype", Promise)
], DigitalPurchasesController.prototype, "createPurchase", null);
__decorate([
    (0, common_1.Get)('my-library'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DigitalPurchasesController.prototype, "getMyLibrary", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DigitalPurchasesController.prototype, "getDownloadLink", null);
__decorate([
    (0, common_1.Get)(':id/stream'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('quality')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DigitalPurchasesController.prototype, "getStreamLink", null);
__decorate([
    (0, common_1.Get)('analytics/:contentId'),
    __param(0, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DigitalPurchasesController.prototype, "getStreamingAnalytics", null);
__decorate([
    (0, common_1.Get)('has-access/:contentId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DigitalPurchasesController.prototype, "hasAccess", null);
exports.DigitalPurchasesController = DigitalPurchasesController = __decorate([
    (0, common_1.Controller)('digital-purchases'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [digital_purchases_service_1.DigitalPurchasesService,
        streaming_service_1.StreamingService,
        prisma_service_1.PrismaService])
], DigitalPurchasesController);
//# sourceMappingURL=digital-purchases.controller.js.map