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
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EscrowService = class EscrowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEscrowTransaction(data) {
        return this.prisma.escrowTransaction.create({
            data: {
                marketplaceItemId: data.marketplaceItemId,
                buyerId: data.buyerId,
                sellerId: data.sellerId,
                amount: data.amount,
                currency: data.currency || 'NGN',
                status: 'PENDING',
            },
        });
    }
    async updateEscrowStatus(transactionId, status, paymentReference, paymentProvider) {
        const updateData = { status };
        if (status === 'PAID') {
            updateData.paidAt = new Date();
            if (paymentReference)
                updateData.paymentReference = paymentReference;
            if (paymentProvider)
                updateData.paymentProvider = paymentProvider;
        }
        else if (status === 'RELEASED') {
            updateData.releasedAt = new Date();
        }
        else if (status === 'REFUNDED') {
            updateData.refundedAt = new Date();
        }
        return this.prisma.escrowTransaction.update({
            where: { id: transactionId },
            data: updateData,
        });
    }
    async getSellerBalance(sellerId) {
        let balance = await this.prisma.sellerBalance.findUnique({
            where: { sellerId },
        });
        if (!balance) {
            balance = await this.prisma.sellerBalance.create({
                data: {
                    sellerId,
                    pending: 0,
                    available: 0,
                    total: 0,
                },
            });
        }
        return balance;
    }
    async updateSellerBalance(sellerId, amount, type) {
        const balance = await this.getSellerBalance(sellerId);
        const updateData = {};
        if (type === 'add_pending') {
            updateData.pending = balance.pending + amount;
        }
        else if (type === 'move_to_available') {
            updateData.pending = balance.pending - amount;
            updateData.available = balance.available + amount;
        }
        else if (type === 'add_total') {
            updateData.total = balance.total + amount;
        }
        return this.prisma.sellerBalance.update({
            where: { sellerId },
            data: updateData,
        });
    }
    async getEscrowTransaction(transactionId) {
        return this.prisma.escrowTransaction.findUnique({
            where: { id: transactionId },
            include: {
                marketplaceItem: true,
                buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
                seller: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }
    async getUserEscrowTransactions(userId) {
        return this.prisma.escrowTransaction.findMany({
            where: {
                OR: [
                    { buyerId: userId },
                    { sellerId: userId },
                ],
            },
            include: {
                marketplaceItem: { select: { id: true, title: true, price: true } },
                buyer: { select: { id: true, firstName: true, lastName: true } },
                seller: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map