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
import { CommunicationsModule } from './communications/communications.module';

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
    CommunicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
