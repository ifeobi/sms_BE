import { Module } from '@nestjs/common';
import { SectionManagementController } from './section-management.controller';
import { SectionManagementService } from './section-management.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SectionManagementController],
  providers: [SectionManagementService],
  exports: [SectionManagementService],
})
export class SectionManagementModule {}
