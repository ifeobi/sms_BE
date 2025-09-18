import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EducationSystemInitService } from './education-system-init.service';
import { EducationSystemController } from './education-system.controller';
import { SchoolTypeMappingService } from './school-type-mapping.service';

@Module({
  imports: [PrismaModule],
  providers: [EducationSystemInitService, SchoolTypeMappingService],
  controllers: [EducationSystemController],
  exports: [EducationSystemInitService, SchoolTypeMappingService],
})
export class EducationSystemModule {}
