import { Module } from '@nestjs/common';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionGuard } from './guards/subscription.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CreatorController],
  providers: [CreatorService, SubscriptionGuard],
  exports: [CreatorService, SubscriptionGuard],
})
export class CreatorModule {}
