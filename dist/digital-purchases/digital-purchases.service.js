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
exports.DigitalPurchasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DigitalPurchasesService = class DigitalPurchasesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPurchase(studentId, dto) {
        const item = await this.prisma.marketplaceItem.findUnique({
            where: { id: dto.marketplaceItemId },
            include: {
                content: true,
                creator: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Marketplace item not found');
        }
        if (!item.content) {
            throw new common_1.BadRequestException('Content not found for this marketplace item');
        }
        if (item.content.contentType !== 'DIGITAL') {
            throw new common_1.BadRequestException('This item is not a digital product');
        }
        const existingPurchase = await this.prisma.digitalPurchase.findFirst({
            where: {
                studentId,
                marketplaceItemId: dto.marketplaceItemId,
                status: 'COMPLETED',
            },
        });
        if (existingPurchase) {
            throw new common_1.BadRequestException('You have already purchased this content');
        }
        if (item.creatorId === studentId) {
            throw new common_1.ForbiddenException('Creators cannot purchase their own digital content');
        }
        const purchase = await this.prisma.digitalPurchase.create({
            data: {
                studentId,
                contentId: item.contentId,
                marketplaceItemId: dto.marketplaceItemId,
                creatorId: item.creatorId,
                amount: item.price,
                currency: item.currency,
                paymentReference: dto.paymentReference,
                paymentMethod: dto.paymentMethod || 'PENDING',
                status: dto.paymentReference ? 'COMPLETED' : 'PENDING',
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
        if (purchase.status === 'COMPLETED') {
            await this.prisma.marketplaceItem.update({
                where: { id: dto.marketplaceItemId },
                data: {
                    totalSales: { increment: 1 },
                    totalRevenue: { increment: item.price },
                },
            });
            await this.prisma.content.update({
                where: { id: item.contentId },
                data: {
                    salesCount: { increment: 1 },
                },
            });
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
    async getStudentLibrary(studentId) {
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
    async getDownloadLink(purchaseId, studentId) {
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
                                fileType: 'DIGITAL_FILE',
                            },
                        },
                    },
                },
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found or not completed');
        }
        await this.prisma.digitalPurchase.update({
            where: { id: purchaseId },
            data: {
                downloadCount: { increment: 1 },
                lastDownloadedAt: new Date(),
            },
        });
        await this.prisma.content.update({
            where: { id: purchase.contentId },
            data: {
                downloadCount: { increment: 1 },
            },
        });
        return purchase;
    }
    async getStreamLink(purchaseId, studentId) {
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
                                fileType: 'DIGITAL_FILE',
                            },
                        },
                    },
                },
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found or not completed');
        }
        await this.prisma.digitalPurchase.update({
            where: { id: purchaseId },
            data: {
                streamCount: { increment: 1 },
                lastStreamedAt: new Date(),
            },
        });
        await this.prisma.content.update({
            where: { id: purchase.contentId },
            data: {
                streamCount: { increment: 1 },
            },
        });
        return purchase;
    }
    async hasAccess(studentId, contentId) {
        const purchase = await this.prisma.digitalPurchase.findFirst({
            where: {
                studentId,
                contentId,
                status: 'COMPLETED',
            },
        });
        return !!purchase;
    }
};
exports.DigitalPurchasesService = DigitalPurchasesService;
exports.DigitalPurchasesService = DigitalPurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DigitalPurchasesService);
//# sourceMappingURL=digital-purchases.service.js.map