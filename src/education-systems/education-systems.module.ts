import { Module } from '@nestjs/common';
import { EducationSystemsController } from './education-systems.controller';
import { EducationSystemsService } from './education-systems.service';

@Module({
  controllers: [EducationSystemsController],
  providers: [EducationSystemsService],
  exports: [EducationSystemsService],
})
export class EducationSystemsModule {}
