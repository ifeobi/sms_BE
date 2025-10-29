import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageKitService } from './imagekit.service';
import { ImageKitWebhookController } from './imagekit-webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule, 
    PrismaModule, 
    forwardRef(() => FileUploadModule)
  ],
  controllers: [ImageKitWebhookController],
  providers: [ImageKitService],
  exports: [ImageKitService],
})
export class ImageKitModule {}
