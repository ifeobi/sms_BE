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
exports.EscrowController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const escrow_service_1 = require("./escrow.service");
let EscrowController = class EscrowController {
    escrowService;
    constructor(escrowService) {
        this.escrowService = escrowService;
    }
    async createPaymentIntent(req, body) {
        const marketplaceItem = await this.escrowService['prisma'].marketplaceItem.findUnique({
            where: { id: body.marketplaceItemId },
            include: { creator: true },
        });
        if (!marketplaceItem) {
            throw new Error('Marketplace item not found');
        }
        if (marketplaceItem.creator.userId === req.user.id) {
            throw new Error('Cannot purchase your own item');
        }
        const transaction = await this.escrowService.createEscrowTransaction({
            marketplaceItemId: body.marketplaceItemId,
            buyerId: req.user.id,
            sellerId: marketplaceItem.creator.userId,
            amount: body.amount,
            currency: body.currency,
        });
        return {
            success: true,
            transactionId: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            paymentUrl: `https://paystack.com/pay/${transaction.id}`,
        };
    }
    async getUserTransactions(req) {
        const transactions = await this.escrowService.getUserEscrowTransactions(req.user.id);
        return {
            success: true,
            transactions,
        };
    }
    async getSellerBalance(req) {
        const balance = await this.escrowService.getSellerBalance(req.user.id);
        return {
            success: true,
            balance,
        };
    }
    async getTransaction(id, req) {
        const transaction = await this.escrowService.getEscrowTransaction(id);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        if (transaction.buyerId !== req.user.id && transaction.sellerId !== req.user.id) {
            throw new Error('Unauthorized access to transaction');
        }
        return {
            success: true,
            transaction,
        };
    }
    async handlePaymentWebhook(body) {
        console.log('Payment webhook received:', body);
        return {
            success: true,
            message: 'Webhook received (placeholder)',
        };
    }
};
exports.EscrowController = EscrowController;
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "getUserTransactions", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "getSellerBalance", null);
__decorate([
    (0, common_1.Get)('transaction/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)('webhook/payment'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EscrowController.prototype, "handlePaymentWebhook", null);
exports.EscrowController = EscrowController = __decorate([
    (0, common_1.Controller)('escrow'),
    __metadata("design:paramtypes", [escrow_service_1.EscrowService])
], EscrowController);
//# sourceMappingURL=escrow.controller.js.map