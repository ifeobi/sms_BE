import { Module } from '@nestjs/common';
import { BulkImportController } from './bulk-import.controller';
import { BulkImportService } from './bulk-import.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [BulkImportController, StudentsController],
  providers: [BulkImportService, StudentsService],
  exports: [BulkImportService, StudentsService],
})
export class StudentsModule {}
