import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatorService } from './creator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('creator')
@UseGuards(JwtAuthGuard)
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Post('upgrade-plan')
  async upgradePlan(
    @Request() req,
    @Body() body: { reference: string; plan: string },
  ) {
    const { reference, plan } = body;
    const userId = req.user.id; // JWT strategy returns 'id' not 'userId'

    console.log('🔵 [CreatorController] Upgrade plan request received');
    console.log('👤 [CreatorController] User ID:', userId);
    console.log('📦 [CreatorController] Request body:', body);

    if (!reference) {
      console.log('❌ [CreatorController] Missing reference');
      throw new BadRequestException('Payment reference is required');
    }

    if (!plan || !['mid', 'top'].includes(plan)) {
      console.log('❌ [CreatorController] Invalid plan:', plan);
      throw new BadRequestException('Invalid plan type');
    }

    try {
      // Verify payment and upgrade plan
      const result = await this.creatorService.verifyAndUpgradePlan(
        userId,
        reference,
        plan,
      );

      console.log('✅ [CreatorController] Plan upgraded successfully');
      return {
        success: true,
        message: 'Plan upgraded successfully',
        data: result,
      };
    } catch (error) {
      console.error('❌ [CreatorController] Plan upgrade error:', error.message);
      throw new InternalServerErrorException(
        error.message || 'Failed to upgrade plan',
      );
    }
  }

  @Get('plan')
  async getCurrentPlan(@Request() req) {
    const userId = req.user.id; // JWT strategy returns 'id' not 'userId'

    try {
      const plan = await this.creatorService.getCurrentPlan(userId);
      return {
        success: true,
        data: plan,
      };
    } catch (error) {
      console.error('Get plan error:', error);
      throw new InternalServerErrorException('Failed to get plan details');
    }
  }

  @Get('subscription/usage')
  async getSubscriptionWithUsage(@Request() req) {
    const userId = req.user.id;

    try {
      const data = await this.creatorService.getSubscriptionWithUsage(userId);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Get subscription usage error:', error);
      throw new InternalServerErrorException(
        'Failed to get subscription usage',
      );
    }
  }

  @Get('can-create-product')
  async canCreateProduct(@Request() req) {
    const userId = req.user.id;

    try {
      const result = await this.creatorService.canCreateProduct(userId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Check product limit error:', error);
      throw new InternalServerErrorException('Failed to check product limit');
    }
  }
}
