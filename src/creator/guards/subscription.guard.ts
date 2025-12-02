import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CreatorService } from '../creator.service';

/**
 * Guard to check subscription limits before executing a route
 * Usage: @UseGuards(SubscriptionGuard) @CheckLimit('product')
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private creatorService: CreatorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitType = this.reflector.get<string>(
      'checkLimit',
      context.getHandler(),
    );

    // If no limit type specified, allow
    if (!limitType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check based on limit type
    if (limitType === 'product') {
      const check = await this.creatorService.canCreateProduct(userId);
      if (!check.allowed) {
        throw new ForbiddenException({
          message: check.reason,
          limit: check.limit,
          used: check.used,
          upgradeRequired: true,
        });
      }
    }

    return true;
  }
}

/**
 * Decorator to specify which limit to check
 */
export const CheckLimit = (limitType: string) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('checkLimit', limitType, descriptor.value);
    return descriptor;
  };
};

