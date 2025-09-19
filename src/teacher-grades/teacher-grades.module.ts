import { Module } from '@nestjs/common';
import { TeacherGradesController } from './teacher-grades.controller';
import { TeacherGradesService } from './teacher-grades.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherGradesController],
  providers: [TeacherGradesService],
  exports: [TeacherGradesService],
})
export class TeacherGradesModule {}
