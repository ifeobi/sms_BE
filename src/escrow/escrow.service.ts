import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EscrowService {
  constructor(private prisma: PrismaService) {}

  // Create a new escrow transaction (payment intent)
  async createEscrowTransaction(data: {
    marketplaceItemId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    currency?: string;
  }) {
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

  // Update escrow transaction status (called by payment webhook)
  async updateEscrowStatus(
    transactionId: string,
    status: 'PAID' | 'RELEASED' | 'REFUNDED' | 'DISPUTED',
    paymentReference?: string,
    paymentProvider?: string,
  ) {
    const updateData: any = { status };
    
    if (status === 'PAID') {
      updateData.paidAt = new Date();
      if (paymentReference) updateData.paymentReference = paymentReference;
      if (paymentProvider) updateData.paymentProvider = paymentProvider;
    } else if (status === 'RELEASED') {
      updateData.releasedAt = new Date();
    } else if (status === 'REFUNDED') {
      updateData.refundedAt = new Date();
    }

    return this.prisma.escrowTransaction.update({
      where: { id: transactionId },
      data: updateData,
    });
  }

  // Get seller's balance
  async getSellerBalance(sellerId: string) {
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

  // Update seller balance (called when money is released)
  async updateSellerBalance(
    sellerId: string,
    amount: number,
    type: 'add_pending' | 'move_to_available' | 'add_total',
  ) {
    const balance = await this.getSellerBalance(sellerId);
    
    const updateData: any = {};
    
    if (type === 'add_pending') {
      updateData.pending = balance.pending + amount;
    } else if (type === 'move_to_available') {
      updateData.pending = balance.pending - amount;
      updateData.available = balance.available + amount;
    } else if (type === 'add_total') {
      updateData.total = balance.total + amount;
    }

    return this.prisma.sellerBalance.update({
      where: { sellerId },
      data: updateData,
    });
  }

  // Get escrow transaction by ID
  async getEscrowTransaction(transactionId: string) {
    return this.prisma.escrowTransaction.findUnique({
      where: { id: transactionId },
      include: {
        marketplaceItem: true,
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  // Get all escrow transactions for a user (as buyer or seller)
  async getUserEscrowTransactions(userId: string) {
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
}
