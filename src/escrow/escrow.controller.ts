import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EscrowService } from './escrow.service';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  // Create payment intent
  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Request() req: any,
    @Body() body: {
      marketplaceItemId: string;
      amount: number;
      currency?: string;
    },
  ) {
    // Get marketplace item to find seller
    const marketplaceItem = await this.escrowService['prisma'].marketplaceItem.findUnique({
      where: { id: body.marketplaceItemId },
      include: { creator: true },
    });

    if (!marketplaceItem) {
      throw new Error('Marketplace item not found');
    }

    // Prevent self-purchase
    if (marketplaceItem.creator.userId === req.user.id) {
      throw new Error('Cannot purchase your own item');
    }

    // Create escrow transaction
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
      // In real implementation, this would return payment provider details
      paymentUrl: `https://paystack.com/pay/${transaction.id}`, // Placeholder
    };
  }

  // Get user's escrow transactions
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getUserTransactions(@Request() req: any) {
    const transactions = await this.escrowService.getUserEscrowTransactions(req.user.id);
    return {
      success: true,
      transactions,
    };
  }

  // Get seller balance
  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getSellerBalance(@Request() req: any) {
    const balance = await this.escrowService.getSellerBalance(req.user.id);
    return {
      success: true,
      balance,
    };
  }

  // Get specific transaction details
  @Get('transaction/:id')
  @UseGuards(JwtAuthGuard)
  async getTransaction(@Param('id') id: string, @Request() req: any) {
    const transaction = await this.escrowService.getEscrowTransaction(id);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Check if user is buyer or seller
    if (transaction.buyerId !== req.user.id && transaction.sellerId !== req.user.id) {
      throw new Error('Unauthorized access to transaction');
    }

    return {
      success: true,
      transaction,
    };
  }

  // Webhook endpoint for payment providers (placeholder)
  @Post('webhook/payment')
  async handlePaymentWebhook(@Body() body: any) {
    // This would be implemented based on Paystack/Flutterwave webhook format
    console.log('Payment webhook received:', body);
    
    // Placeholder response
    return {
      success: true,
      message: 'Webhook received (placeholder)',
    };
  }
}
