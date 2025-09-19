import { Module } from '@nestjs/common';
import { AcademicStructureService } from './academic-structure.service';
import { AcademicStructureController } from './academic-structure.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EducationSystemsModule } from '../education-systems/education-systems.module';
import { SectionManagementModule } from '../section-management/section-management.module';

@Module({
  imports: [PrismaModule, EducationSystemsModule, SectionManagementModule],
  controllers: [AcademicStructureController],
  providers: [AcademicStructureService],
  exports: [AcademicStructureService],
})
export class AcademicStructureModule {}
