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
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileType } from '@prisma/client';
import { ImageKitService } from '../imagekit/imagekit.service';
import { 
  VideoUploadRequestDto, 
  VideoUploadResponseDto, 
  VideoTransformDto,
  VideoThumbnailDto 
} from '../imagekit/dto/video-upload.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

@ApiTags('File Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly imageKitService: ImageKitService,
  ) {}

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
    return this.fileUploadService.uploadMultipleFiles(
      files,
      contentId,
      fileType,
    );
  }

  @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: string, @Request() req) {
    const creatorId = req.user.creatorId || req.user.id;
    await this.fileUploadService.deleteFile(fileId, creatorId);
    return { message: 'File deleted successfully' };
  }

  // ==================== VIDEO UPLOAD ENDPOINTS ====================

  @Post('video/request-url')
  @ApiOperation({ summary: 'Get secure upload URL for video upload to ImageKit' })
  @ApiResponse({ 
    status: 201, 
    description: 'Upload URL generated successfully',
    type: VideoUploadResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  async requestVideoUploadUrl(
    @Body() videoUploadDto: VideoUploadRequestDto,
    @Request() req,
  ): Promise<VideoUploadResponseDto> {
    const creatorId = req.user.creatorId || req.user.id;
    
    return this.imageKitService.generateUploadUrl(
      videoUploadDto.filename,
      videoUploadDto.fileSize,
      creatorId,
      videoUploadDto.contentId,
    );
  }

  @Post('video/webhook')
  @ApiOperation({ summary: 'Handle ImageKit webhook notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleVideoWebhook(@Body() webhookData: any, @Request() req) {
    // This endpoint will be called by ImageKit when video processing is complete
    const { fileId, status, url, metadata } = webhookData;
    
    if (status === 'completed') {
      // Save video details to database
      await this.fileUploadService.saveVideoToDatabase({
        fileId,
        url,
        metadata,
        creatorId: req.user.creatorId || req.user.id,
      });
    }
    
    return { message: 'Webhook processed successfully' };
  }

  @Get('video/:fileId/url')
  @ApiOperation({ summary: 'Get optimized video URL' })
  @ApiResponse({ status: 200, description: 'Video URL generated successfully' })
  async getVideoUrl(
    @Param('fileId') fileId: string,
    @Query() transformDto: VideoTransformDto,
  ) {
    const optimizedUrl = this.imageKitService.getOptimizedVideoUrl(fileId, transformDto);
    return { url: optimizedUrl };
  }

  @Get('video/:fileId/thumbnail')
  @ApiOperation({ summary: 'Get video thumbnail URL' })
  @ApiResponse({ status: 200, description: 'Thumbnail URL generated successfully' })
  async getVideoThumbnail(
    @Param('fileId') fileId: string,
    @Query() thumbnailDto: VideoThumbnailDto,
  ) {
    const thumbnailUrl = this.imageKitService.getVideoThumbnailUrl(
      fileId, 
      thumbnailDto.timeInSeconds
    );
    return { url: thumbnailUrl };
  }

  @Get('video/:fileId/thumbnails')
  @ApiOperation({ summary: 'Get multiple video thumbnails for preview' })
  @ApiResponse({ status: 200, description: 'Thumbnail URLs generated successfully' })
  @ApiQuery({ name: 'count', required: false, description: 'Number of thumbnails (default: 5)' })
  async getVideoThumbnails(
    @Param('fileId') fileId: string,
    @Query('count') count: number = 5,
  ) {
    const thumbnails = this.imageKitService.generateVideoThumbnails(fileId, count);
    return { thumbnails };
  }

  @Get('video/:fileId/stream')
  @ApiOperation({ summary: 'Get adaptive video streaming URL' })
  @ApiResponse({ status: 200, description: 'Streaming URL generated successfully' })
  @ApiQuery({ 
    name: 'quality', 
    required: false, 
    enum: ['low', 'medium', 'high'],
    description: 'Video quality (default: medium)' 
  })
  async getVideoStream(
    @Param('fileId') fileId: string,
    @Query('quality') quality: 'low' | 'medium' | 'high' = 'medium',
  ) {
    const streamUrl = this.imageKitService.getAdaptiveVideoUrl(fileId, quality);
    return { url: streamUrl };
  }

  @Delete('video/:fileId')
  @ApiOperation({ summary: 'Delete video from ImageKit' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  async deleteVideo(@Param('fileId') fileId: string, @Request() req) {
    const creatorId = req.user.creatorId || req.user.id;
    
    // Verify ownership before deletion
    const videoDetails = await this.imageKitService.getVideoDetails(fileId);
    if (!videoDetails || videoDetails.customMetadata?.creatorId !== creatorId) {
      throw new BadRequestException('Unauthorized to delete this video');
    }
    
    const deleted = await this.imageKitService.deleteVideo(fileId);
    if (deleted) {
      // Also remove from database
      await this.fileUploadService.deleteVideoFromDatabase(fileId);
    }
    
    return { message: 'Video deleted successfully' };
  }
}
