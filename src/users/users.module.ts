import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SettingsService } from './settings.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, SettingsService],
  exports: [UsersService, SettingsService],
})
export class UsersModule {}
