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
    async createPurchase(buyerId, buyerType, dto) {
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
        let beneficiaryStudentIds = [];
        if (buyerType === 'PARENT') {
            if (!dto.beneficiaryStudentIds || dto.beneficiaryStudentIds.length === 0) {
                throw new common_1.BadRequestException('Parent purchases must specify at least one beneficiary student.');
            }
            const parent = await this.prisma.parent.findUnique({
                where: { userId: buyerId },
                include: {
                    user: true,
                },
            });
            if (!parent) {
                throw new common_1.ForbiddenException('Parent not found');
            }
            const relationships = await this.prisma.parentSchoolRelationship.findMany({
                where: { parentUserId: buyerId, isActive: true },
                include: { children: true },
            });
            const validStudentIds = new Set();
            relationships.forEach((rel) => {
                rel.children.forEach((student) => {
                    validStudentIds.add(student.id);
                });
            });
            for (const studentId of dto.beneficiaryStudentIds) {
                if (!validStudentIds.has(studentId)) {
                    throw new common_1.ForbiddenException(`Student ${studentId} is not linked to this parent account`);
                }
            }
            beneficiaryStudentIds = dto.beneficiaryStudentIds;
        }
        else {
            const student = await this.prisma.student.findUnique({
                where: { userId: buyerId },
            });
            if (!student) {
                throw new common_1.ForbiddenException('Student not found');
            }
            beneficiaryStudentIds = [student.id];
        }
        const creator = await this.prisma.creator.findUnique({
            where: { id: item.creatorId },
            include: { user: true },
        });
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        if (creator.userId === buyerId && buyerType === 'STUDENT') {
            throw new common_1.ForbiddenException('Creators cannot purchase their own digital content for themselves');
        }
        const purchases = [];
        const paymentStatus = dto.paymentReference ? 'COMPLETED' : 'PENDING';
        const completedAt = dto.paymentReference ? new Date() : null;
        for (const studentId of beneficiaryStudentIds) {
            const existingPurchase = await this.prisma.digitalPurchase.findFirst({
                where: {
                    studentId,
                    marketplaceItemId: dto.marketplaceItemId,
                    status: 'COMPLETED',
                },
            });
            if (existingPurchase) {
                throw new common_1.BadRequestException(`Student ${studentId} has already purchased this content`);
            }
            const purchase = await this.prisma.digitalPurchase.create({
                data: {
                    studentId,
                    buyerId,
                    buyerType: (buyerType === 'PARENT' ? 'PARENT' : 'STUDENT'),
                    contentId: item.contentId,
                    marketplaceItemId: dto.marketplaceItemId,
                    creatorId: item.creatorId,
                    amount: item.price,
                    currency: item.currency,
                    paymentReference: dto.paymentReference,
                    paymentMethod: dto.paymentMethod || 'PENDING',
                    status: paymentStatus,
                    completedAt,
                    giftMessage: buyerType === 'PARENT' ? dto.giftMessage : null,
                },
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
                },
            });
            purchases.push(purchase);
        }
        if (paymentStatus === 'COMPLETED') {
            const totalAmount = item.price * purchases.length;
            await this.prisma.marketplaceItem.update({
                where: { id: dto.marketplaceItemId },
                data: {
                    totalSales: { increment: purchases.length },
                    totalRevenue: { increment: totalAmount },
                },
            });
            await this.prisma.content.update({
                where: { id: item.contentId },
                data: {
                    salesCount: { increment: purchases.length },
                },
            });
            await this.prisma.creator.update({
                where: { id: item.creatorId },
                data: {
                    totalSales: { increment: purchases.length },
                    totalRevenue: { increment: totalAmount },
                },
            });
        }
        return purchases.length === 1 ? purchases[0] : purchases;
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
                buyer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                completedAt: 'desc',
            },
        });
        return purchases;
    }
    async getParentPurchases(parentUserId) {
        const purchases = await this.prisma.digitalPurchase.findMany({
            where: {
                buyerId: parentUserId,
                buyerType: 'PARENT',
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