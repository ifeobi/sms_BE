import { Module } from '@nestjs/common';
import { SchoolAcademicStructureController } from './school-academic-structure.controller';
import { SchoolAcademicStructureService } from './school-academic-structure.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchoolAcademicStructureController],
  providers: [SchoolAcademicStructureService],
  exports: [SchoolAcademicStructureService],
})
export class SchoolAcademicStructureModule {}

