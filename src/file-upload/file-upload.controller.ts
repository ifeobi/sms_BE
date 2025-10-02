import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileType } from '@prisma/client';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('contentId') contentId: string,
    @Body('fileType') fileType: FileType,
  ) {
    return this.fileUploadService.uploadFile(file, contentId, fileType);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('contentId') contentId: string,
    @Body('fileType') fileType: FileType,
  ) {
    return this.fileUploadService.uploadMultipleFiles(files, contentId, fileType);
  }

  @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: string, @Request() req) {
    const creatorId = req.user.creatorId || req.user.id;
    await this.fileUploadService.deleteFile(fileId, creatorId);
    return { message: 'File deleted successfully' };
  }
}

