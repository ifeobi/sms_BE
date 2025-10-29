import { Module } from '@nestjs/common';
import { DigitalPurchasesService } from './digital-purchases.service';
import { StreamingService } from './streaming.service';
import { DigitalPurchasesController } from './digital-purchases.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageKitModule } from '../imagekit/imagekit.module';

@Module({
  imports: [PrismaModule, ImageKitModule],
  controllers: [DigitalPurchasesController],
  providers: [DigitalPurchasesService, StreamingService],
  exports: [DigitalPurchasesService, StreamingService],
})
export class DigitalPurchasesModule {}
