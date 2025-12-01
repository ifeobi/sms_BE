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
import { EducationSystemsModule } from './education-systems/education-systems.module';
import { SectionManagementModule } from './section-management/section-management.module';
import { AcademicStructureModule } from './academic-structure/academic-structure.module';
import { ImageKitModule } from './imagekit/imagekit.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ContentModule } from './content/content.module';
import { DigitalPurchasesModule } from './digital-purchases/digital-purchases.module';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
