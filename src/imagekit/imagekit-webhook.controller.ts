import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageKitService } from './imagekit.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('ImageKit Webhooks')
@Controller('webhooks/imagekit')
export class ImageKitWebhookController {
  private readonly logger = new Logger(ImageKitWebhookController.name);

  constructor(
    private readonly imageKitService: ImageKitService,
    private readonly fileUploadService: FileUploadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('video-upload')
  @ApiOperation({ summary: 'Handle ImageKit video upload webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleVideoUploadWebhook(
    @Body() webhookData: any,
    @Headers() headers: any,
  ) {
    try {
      this.logger.log('Received ImageKit video upload webhook');
      this.logger.debug('Webhook data:', JSON.stringify(webhookData, null, 2));
      this.logger.debug('Headers:', JSON.stringify(headers, null, 2));

      const { type, data } = webhookData;

      if (type === 'video.uploaded') {
        await this.handleVideoUploaded(data);
      } else if (type === 'video.processing.completed') {
        await this.handleVideoProcessingCompleted(data);
      } else if (type === 'video.processing.failed') {
        await this.handleVideoProcessingFailed(data);
      } else if (type === 'video.deleted') {
        await this.handleVideoDeleted(data);
      } else {
        this.logger.warn(`Unknown webhook type: ${type}`);
      }

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Error processing ImageKit webhook:', error);
      throw error;
    }
  }

  private async handleVideoUploaded(data: any) {
    this.logger.log('Processing video uploaded event');
    
    const {
      fileId,
      name,
      url,
      size,
      mimeType,
      customMetadata,
    } = data;

    try {
      // Save video to database
      const videoData = {
        fileId,
        url,
        metadata: {
          filename: name,
          size,
          mimeType,
          creatorId: customMetadata?.creatorId,
          contentId: customMetadata?.contentId,
        },
        creatorId: customMetadata?.creatorId,
      };

      await this.fileUploadService.saveVideoToDatabase(videoData);
      this.logger.log(`Video ${fileId} saved to database successfully`);
    } catch (error) {
      this.logger.error(`Failed to save video ${fileId} to database:`, error);
      throw error;
    }
  }

  private async handleVideoProcessingCompleted(data: any) {
    this.logger.log('Processing video processing completed event');
    
    const {
      fileId,
      url,
      thumbnailUrl,
      duration,
      customMetadata,
    } = data;

    try {
      // Update video with processing results
      await this.prisma.contentFile.updateMany({
        where: {
          imageKitFileId: fileId,
        },
        data: {
          imageKitUrl: url,
          thumbnailUrl: thumbnailUrl,
          videoDuration: duration,
          isProcessed: true,
        },
      });

      this.logger.log(`Video ${fileId} processing completed and updated in database`);
    } catch (error) {
      this.logger.error(`Failed to update video ${fileId} after processing:`, error);
      throw error;
    }
  }

  private async handleVideoProcessingFailed(data: any) {
    this.logger.log('Processing video processing failed event');
    
    const {
      fileId,
      error: processingError,
      customMetadata,
    } = data;

    try {
      // Update video with failure status
      await this.prisma.contentFile.updateMany({
        where: {
          imageKitFileId: fileId,
        },
        data: {
          isProcessed: false,
          // You might want to add an error field to track processing failures
        },
      });

      this.logger.error(`Video ${fileId} processing failed:`, processingError);
    } catch (error) {
      this.logger.error(`Failed to update video ${fileId} after processing failure:`, error);
      throw error;
    }
  }

  private async handleVideoDeleted(data: any) {
    this.logger.log('Processing video deleted event');
    
    const { fileId } = data;

    try {
      // Remove video from database
      await this.fileUploadService.deleteVideoFromDatabase(fileId);
      this.logger.log(`Video ${fileId} removed from database`);
    } catch (error) {
      this.logger.error(`Failed to remove video ${fileId} from database:`, error);
      throw error;
    }
  }

  @Post('test')
  @ApiOperation({ summary: 'Test webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Test webhook received' })
  async testWebhook(@Body() data: any) {
    this.logger.log('Test webhook received');
    this.logger.debug('Test data:', JSON.stringify(data, null, 2));
    return { message: 'Test webhook received successfully' };
  }
}
