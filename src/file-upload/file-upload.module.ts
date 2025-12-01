import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageKitModule } from '../imagekit/imagekit.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ImageKitModule),
    // Remove local storage configuration - files will be uploaded directly to ImageKit
    MulterModule.register({
      // Use memory storage for temporary file handling before ImageKit upload
      storage: require('multer').memoryStorage(),
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
