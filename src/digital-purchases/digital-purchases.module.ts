import { Module } from '@nestjs/common';
import { DigitalPurchasesService } from './digital-purchases.service';
import { DigitalPurchasesController } from './digital-purchases.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DigitalPurchasesController],
  providers: [DigitalPurchasesService],
  exports: [DigitalPurchasesService],
})
export class DigitalPurchasesModule {}
