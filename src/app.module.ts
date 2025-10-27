import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchoolModule } from './school/school.module';
import { StudentsModule } from './students/students.module';
import { StaffModule } from './staff/staff.module';
import { ContentModule } from './content/content.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { DigitalPurchasesModule } from './digital-purchases/digital-purchases.module';
import { RatingsModule } from './ratings/ratings.module';
import { EscrowModule } from './escrow/escrow.module';
import { CreatorHistoryModule } from './creator/creator-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SchoolModule,
    StudentsModule,
    StaffModule,
    ContentModule,
    FileUploadModule,
    MarketplaceModule,
    DigitalPurchasesModule,
    RatingsModule,
    EscrowModule,
    CreatorHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
