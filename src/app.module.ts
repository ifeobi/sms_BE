import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchoolModule } from './school/school.module';
import { StudentsModule } from './students/students.module';
import { StaffModule } from './staff/staff.module';
import { EducationSystemsModule } from './education-systems/education-systems.module';
import { SectionManagementModule } from './section-management/section-management.module';
import { AcademicStructureModule } from './academic-structure/academic-structure.module';
import { ImageKitModule } from './imagekit/imagekit.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ContentModule } from './content/content.module';
import { DigitalPurchasesModule } from './digital-purchases/digital-purchases.module';
import { TeachersModule } from './teachers/teachers.module';
import { CreatorModule } from './creator/creator.module';
import { RatingsModule } from './ratings/ratings.module';
import { EscrowModule } from './escrow/escrow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 100 },
      { name: 'long', ttl: 3600_000, limit: 2000 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SchoolModule,
    StudentsModule,
    StaffModule,
    EducationSystemsModule,
    SectionManagementModule,
    AcademicStructureModule,
    ImageKitModule,
    MarketplaceModule,
    ContentModule,
    DigitalPurchasesModule,
    TeachersModule,
    CreatorModule,
    RatingsModule,
    EscrowModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
