import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { getPlanLimits } from './constants/plan-limits';

@Injectable()
export class CreatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify payment with Paystack and upgrade creator plan
   */
  async verifyAndUpgradePlan(
    userId: string,
    reference: string,
    planType: string,
  ) {
    console.log('🔵 [CreatorService] Starting payment verification');
    console.log('📋 [CreatorService] User ID:', userId);
    console.log('🔑 [CreatorService] Reference:', reference);
    console.log('📦 [CreatorService] Plan Type:', planType);

    // 1. Verify payment with Paystack
    console.log('📡 [CreatorService] Verifying payment with Paystack...');
    const paymentData = await this.verifyPaystackPayment(reference);

    if (!paymentData || paymentData.status !== 'success') {
      console.log(
        '❌ [CreatorService] Payment verification failed:',
        paymentData,
      );
      throw new BadRequestException('Payment verification failed');
    }

    console.log('✅ [CreatorService] Payment verified successfully');
    console.log(
      '💰 [CreatorService] Amount:',
      paymentData.amount / 100,
      paymentData.currency,
    );

    // 1.5. Validate payment amount based on card country (anti-fraud)
    const cardCountry =
      paymentData.authorization?.country_code?.toUpperCase() || 'UNKNOWN'; // Case-insensitive + null-safe
    const amountPaid = paymentData.amount / 100; // Convert from kobo/cents
    const currency = paymentData.currency?.toUpperCase() || 'NGN'; // Case-insensitive + null-safe (default to NGN)

    console.log('🌍 [CreatorService] Card country:', cardCountry);
    console.log('💳 [CreatorService] Payment currency:', currency);

    // Security check: If card country is unknown, reject payment
    if (cardCountry === 'UNKNOWN') {
      console.log('⚠️ [CreatorService] Card country could not be determined');
      throw new BadRequestException(
        'Unable to verify card information. Please try again or contact support.',
      );
    }

    // Enforce minimum amounts by plan and region
    const minAmounts = {
      mid: {
        NGN: 2000, // Nigeria
        USD: 5, // USA and rest of world
      },
      top: {
        NGN: 5000,
        USD: 10,
      },
    };

    // Determine expected amount based on currency (NOT user's claimed country)
    // Using normalized uppercase currency
    const expectedAmount =
      currency === 'NGN'
        ? minAmounts[planType]?.NGN
        : minAmounts[planType]?.USD;

    if (!expectedAmount) {
      console.log('❌ [CreatorService] Invalid plan type:', planType);
      throw new BadRequestException('Invalid plan type');
    }

    // Additional security: Check card country vs currency mismatch
    // Nigerian cards should pay in NGN, non-Nigerian cards in USD
    if (cardCountry === 'NG' && currency !== 'NGN') {
      console.log(
        '⚠️ [CreatorService] Nigerian card paying in non-NGN currency',
      );
      throw new BadRequestException(
        'Payment currency mismatch. Please refresh the page and try again.',
      );
    }

    if (cardCountry !== 'NG' && currency === 'NGN') {
      console.log(
        '⚠️ [CreatorService] Non-Nigerian card attempting to pay in NGN',
      );
      throw new BadRequestException(
        'Payment currency mismatch. Please refresh the page and try again.',
      );
    }

    // Validate amount (allow small tolerance for currency conversion)
    const tolerance = currency === 'NGN' ? 10 : 0.5; // NGN ±10, USD ±$0.50
    if (amountPaid < expectedAmount - tolerance) {
      console.log('❌ [CreatorService] Insufficient payment amount');
      console.log('Expected:', expectedAmount, currency);
      console.log('Received:', amountPaid, currency);
      throw new BadRequestException(
        `Payment amount doesn't match the selected plan. Please contact support.`,
      );
    }

    console.log('✅ [CreatorService] Payment amount validated');

    // 2. Check if payment was already used
    console.log('🔍 [CreatorService] Checking for duplicate transactions...');
    const existingTransaction = await this.prisma.creatorTransaction.findUnique(
      {
        where: { reference },
      },
    );

    if (existingTransaction) {
      console.log(
        '⚠️ [CreatorService] Transaction already exists:',
        existingTransaction.id,
      );
      throw new BadRequestException(
        'This payment reference has already been used',
      );
    }

    console.log('✅ [CreatorService] No duplicate found, proceeding...');

    // 3. Determine plan details
    const planDetails = this.getPlanDetails(planType);
    console.log('📋 [CreatorService] Plan details:', planDetails);

    // 4. Calculate subscription end date (1 month from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    console.log('📅 [CreatorService] Subscription period:', {
      startDate,
      endDate,
    });

    // 5. Create transaction record and update user plan in a transaction
    console.log('💾 [CreatorService] Creating database records...');
    const result = await this.prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.creatorTransaction.create({
        data: {
          userId,
          reference,
          paystackTransactionId: paymentData.id.toString(),
          amount: paymentData.amount / 100, // Convert from kobo to naira
          currency: paymentData.currency,
          status: 'success',
          plan: planType,
          metadata: paymentData.metadata,
          paidAt: new Date(paymentData.paid_at),
        },
      });

      console.log(
        '✅ [CreatorService] Transaction record created:',
        transaction.id,
      );

      // Update or create creator subscription
      const subscription = await tx.creatorSubscription.upsert({
        where: { userId },
        update: {
          plan: planType,
          platformFeePercentage: planDetails.platformFee,
          status: 'active',
          startDate,
          endDate,
          lastPaymentReference: reference,
          updatedAt: new Date(),
        },
        create: {
          userId,
          plan: planType,
          platformFeePercentage: planDetails.platformFee,
          status: 'active',
          startDate,
          endDate,
          lastPaymentReference: reference,
        },
      });

      console.log(
        '✅ [CreatorService] Subscription record updated:',
        subscription.id,
      );

      return { transaction, subscription };
    });

    console.log('🎉 [CreatorService] Plan upgrade complete!');
    return result;
  }

  /**
   * Verify payment with Paystack API
   */
  private async verifyPaystackPayment(reference: string) {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET_KEY) {
      console.log('❌ [CreatorService] Paystack secret key not configured');
      throw new Error('Paystack secret key not configured');
    }

    console.log('📡 [CreatorService] Calling Paystack API...');
    console.log(
      '🔗 [CreatorService] URL:',
      `https://api.paystack.co/transaction/verify/${reference}`,
    );

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      console.log('✅ [CreatorService] Paystack API response received');
      console.log(
        '📄 [CreatorService] Response data:',
        JSON.stringify(response.data.data, null, 2),
      );

      return response.data.data;
    } catch (error) {
      console.error(
        '❌ [CreatorService] Paystack verification error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Payment verification failed');
    }
  }

  /**
   * Get plan configuration details
   */
  private getPlanDetails(planType: string) {
    return getPlanLimits(planType);
  }

  /**
   * Get current plan for a creator
   */
  async getCurrentPlan(userId: string) {
    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!subscription) {
      // Return default free plan with consistent structure
      return {
        plan: 'free',
        platformFeePercentage: 10,
        status: 'active',
        startDate: null,
        endDate: null,
        lastPaymentReference: null,
      };
    }

    // Check if subscription has expired
    if (subscription.endDate && new Date() > subscription.endDate) {
      // Auto-downgrade to free plan
      const updated = await this.prisma.creatorSubscription.update({
        where: { userId },
        data: {
          plan: 'free',
          platformFeePercentage: 10,
          status: 'expired',
        },
      });

      return {
        plan: 'free',
        platformFeePercentage: 10,
        status: 'expired',
        startDate: updated.startDate ? updated.startDate.toISOString() : null,
        endDate: updated.endDate ? updated.endDate.toISOString() : null,
        lastPaymentReference: updated.lastPaymentReference,
        previousPlan: subscription.plan,
      };
    }

    // Return active subscription with consistent structure
    return {
      plan: subscription.plan,
      platformFeePercentage: subscription.platformFeePercentage,
      status: subscription.status,
      startDate: subscription.startDate
        ? subscription.startDate.toISOString()
        : null,
      endDate: subscription.endDate ? subscription.endDate.toISOString() : null,
      lastPaymentReference: subscription.lastPaymentReference,
    };
  }

  /**
   * Get usage statistics for a creator
   */
  async getUsageStats(userId: string) {
    // Get creator ID
    const creator = await this.prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      return {
        productsUsed: 0,
        storageUsedMB: 0,
        promoDaysUsedThisMonth: 0,
      };
    }

    // Count products
    const productsCount = await this.prisma.content.count({
      where: {
        creatorId: creator.id,
        status: { not: 'ARCHIVED' }, // Don't count archived products
      },
    });

    // Calculate total storage used (sum of all file sizes)
    const files = await this.prisma.contentFile.findMany({
      where: {
        content: {
          creatorId: creator.id,
        },
      },
      select: {
        sizeBytes: true,
      },
    });

    const totalBytes = files.reduce((sum, file) => {
      return sum + (file.sizeBytes ? Number(file.sizeBytes) : 0);
    }, 0);

    const storageUsedMB = Math.round(totalBytes / (1024 * 1024)); // Convert to MB

    // TODO: Track promo days usage (needs marketplace promo tracking table)
    // For now, return 0
    const promoDaysUsedThisMonth = 0;

    return {
      productsUsed: productsCount,
      storageUsedMB,
      promoDaysUsedThisMonth,
    };
  }

  /**
   * Check if creator can create a new product
   */
  async canCreateProduct(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    limit?: number;
    used?: number;
  }> {
    // Get current plan
    const subscription = await this.getCurrentPlan(userId);
    const planLimits = getPlanLimits(subscription.plan);

    // Unlimited products (Top Tier)
    if (planLimits.maxProducts === -1) {
      return { allowed: true };
    }

    // Get usage
    const usage = await this.getUsageStats(userId);

    if (usage.productsUsed >= planLimits.maxProducts) {
      return {
        allowed: false,
        reason: `You've reached your ${planLimits.name} plan limit of ${planLimits.maxProducts} products`,
        limit: planLimits.maxProducts,
        used: usage.productsUsed,
      };
    }

    return {
      allowed: true,
      limit: planLimits.maxProducts,
      used: usage.productsUsed,
    };
  }

  /**
   * Check if creator can upload a file of given size
   */
  async canUploadFile(
    userId: string,
    fileSizeMB: number,
  ): Promise<{
    allowed: boolean;
    reason?: string;
    limit?: number;
    used?: number;
  }> {
    // Get current plan
    const subscription = await this.getCurrentPlan(userId);
    const planLimits = getPlanLimits(subscription.plan);

    // Get usage
    const usage = await this.getUsageStats(userId);

    const newTotal = usage.storageUsedMB + fileSizeMB;

    if (newTotal > planLimits.storage) {
      return {
        allowed: false,
        reason: `This upload would exceed your ${planLimits.name} plan storage limit of ${planLimits.storage}MB`,
        limit: planLimits.storage,
        used: usage.storageUsedMB,
      };
    }

    return {
      allowed: true,
      limit: planLimits.storage,
      used: usage.storageUsedMB,
    };
  }

  /**
   * Get subscription with limits and usage
   */
  async getSubscriptionWithUsage(userId: string) {
    const [subscription, usage] = await Promise.all([
      this.getCurrentPlan(userId),
      this.getUsageStats(userId),
    ]);

    const limits = getPlanLimits(subscription.plan);

    return {
      subscription,
      limits,
      usage,
    };
  }
}
