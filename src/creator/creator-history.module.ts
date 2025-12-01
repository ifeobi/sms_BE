import { Module } from '@nestjs/common';
import { CreatorHistoryService } from './creator-history.service';
import { CreatorHistoryController } from './creator-history.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CreatorHistoryController],
  providers: [CreatorHistoryService],
  exports: [CreatorHistoryService],
})
export class CreatorHistoryModule {}
