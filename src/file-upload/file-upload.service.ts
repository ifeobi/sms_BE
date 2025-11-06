import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';
import { ImageKitService } from '../imagekit/imagekit.service';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  constructor(
    private prisma: PrismaService,
    private imageKitService: ImageKitService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    contentId: string,
    fileType: FileType,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Step 1: Delete existing files of the same type for this content
    await this.deleteExistingFilesByType(contentId, fileType);

    // Step 2: Try to upload to ImageKit, fallback to local storage on ANY error
    let uploadResult: { fileId?: string; url: string };
    try {
      uploadResult = await this.uploadToImageKit(file, contentId, fileType);
      console.log(`✅ ImageKit upload succeeded for ${fileType}:`, {
        fileId: uploadResult.fileId,
        url: uploadResult.url.substring(0, 80) + '...',
      });
    } catch (error: any) {
      // Log ALL errors for debugging
      const errorMessage = error.message || '';
      const errorCode = error.code || '';
      
      console.error('❌ ImageKit upload failed:', {
        code: errorCode,
        message: errorMessage,
        fileType,
        contentId,
        fileName: file.originalname,
      });
      
      // Check if it's a network/connectivity error
      const isNetworkError = 
        errorCode === 'ENOTFOUND' ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'ETIMEDOUT' ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('Cannot reach ImageKit') ||
        errorMessage.includes('Cannot connect to ImageKit') ||
        errorMessage.includes('ImageKit servers are unreachable') ||
        errorMessage.includes('Connection timeout') ||
        errorMessage.includes('Network error');
      
      // For ANY error (network or auth/validation), fall back to local storage
      // This ensures files are always saved, even if ImageKit fails
      console.warn('⚠️ Falling back to local storage due to ImageKit error');
      console.warn('   Error type:', isNetworkError ? 'Network' : 'Other (Auth/Validation)');
      uploadResult = await this.uploadToLocalStorage(file, contentId, fileType);
    }

    // Step 3: Create new file record in database
    // Only set imageKitFileId and imageKitUrl if ImageKit upload actually succeeded
    const isImageKitUrl = uploadResult.url.startsWith('http') && uploadResult.url.includes('imagekit.io');
    const hasImageKitFileId = !!uploadResult.fileId;
    
    console.log('💾 Saving file record to database:', {
      contentId,
      fileType,
      fileName: file.originalname,
      storagePath: uploadResult.url.substring(0, 80) + '...',
      isImageKitUrl,
      hasImageKitFileId,
      imageKitFileId: uploadResult.fileId || 'null',
    });
    
    const fileRecord = await this.prisma.contentFile.create({
      data: {
        contentId,
        fileType,
        originalName: file.originalname,
        storagePath: uploadResult.url, // ImageKit URL or local path
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        // Only set ImageKit fields if upload actually succeeded
        imageKitFileId: hasImageKitFileId ? uploadResult.fileId : null,
        imageKitUrl: isImageKitUrl && hasImageKitFileId ? uploadResult.url : null,
      },
    });
    
    console.log('✅ File record created:', {
      id: fileRecord.id,
      storagePath: fileRecord.storagePath?.substring(0, 80) + '...',
      imageKitUrl: fileRecord.imageKitUrl ? fileRecord.imageKitUrl.substring(0, 80) + '...' : 'null',
      imageKitFileId: fileRecord.imageKitFileId || 'null',
    });

    return {
      id: fileRecord.id,
      originalName: fileRecord.originalName,
      url: uploadResult.url,
      mimeType: fileRecord.mimeType,
      size: Number(fileRecord.sizeBytes),
      fileType: fileRecord.fileType,
      imageKitFileId: uploadResult.fileId || null,
    };
  }

  /**
   * Upload file to ImageKit cloud storage
   */
  private async uploadToImageKit(
    file: Express.Multer.File,
    contentId: string,
    fileType: FileType,
  ): Promise<{ fileId: string; url: string }> {
    try {
      // Generate unique file path for ImageKit
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
      const filePath = `content/${contentId}/${fileType.toLowerCase()}/${timestamp}-${randomId}${fileExtension}`;

      // Upload to ImageKit
      // Note: Using tags and folder structure for identification instead of customMetadata
      // customMetadata can cause issues with ImageKit validation
      const uploadResult = await this.imageKitService.uploadFile({
        file: file.buffer,
        fileName: file.originalname,
        folder: `content/${contentId}/${fileType.toLowerCase()}`,
        useUniqueFileName: true,
        tags: [fileType.toLowerCase(), `content-${contentId}`, `original-${file.originalname.replace(/[^a-zA-Z0-9]/g, '-')}`],
        // Removed customMetadata - using tags instead for better compatibility
      });

      return {
        fileId: uploadResult.fileId,
        url: uploadResult.url,
      };
    } catch (error: any) {
      console.error('ImageKit upload failed:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      // Provide user-friendly error message
      let errorMessage = error.message;
      if (error.message?.includes('ENOTFOUND')) {
        errorMessage = 'Cannot connect to ImageKit servers. Please check your internet connection.';
      } else if (error.message?.includes('ECONNREFUSED')) {
        errorMessage = 'ImageKit servers are unreachable. Please check your network connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'ImageKit upload timed out. Please try again.';
      }

      throw new BadRequestException(`Failed to upload file to ImageKit: ${errorMessage}`);
    }
  }

  /**
   * Upload file to local storage (fallback when ImageKit is unavailable)
   */
  private async uploadToLocalStorage(
    file: Express.Multer.File,
    contentId: string,
    fileType: FileType,
  ): Promise<{ url: string }> {
    try {
      // Create uploads directory structure: uploads/content/{contentId}/{fileType}/
      const uploadsDir = join(process.cwd(), 'uploads', 'content', contentId, fileType.toLowerCase());
      
      // Create directory if it doesn't exist
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
      const fileName = `${timestamp}-${randomId}${fileExtension}`;
      const filePath = join(uploadsDir, fileName);

      // Write file to disk
      writeFileSync(filePath, file.buffer);

      // Return relative path that will be served as /images/...
      const relativePath = `content/${contentId}/${fileType.toLowerCase()}/${fileName}`;
      const url = `/images/${relativePath}`;

      console.log(`✅ File saved to local storage: ${url}`);
      
      return { url };
    } catch (error: any) {
      console.error('Local storage upload failed:', error);
      throw new BadRequestException(`Failed to save file locally: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    contentId: string,
    fileType: FileType,
  ): Promise<any[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) =>
      this.uploadFile(file, contentId, fileType),
    );

    return Promise.all(uploadPromises);
  }

  async deleteExistingFilesByType(
    contentId: string,
    fileType: FileType,
  ): Promise<void> {
    // Find all existing files of the same type for this content
    const existingFiles = await this.prisma.contentFile.findMany({
      where: {
        contentId,
        fileType,
      },
    });

    // Delete each existing file record AND delete from ImageKit if it exists there
    for (const file of existingFiles) {
      // Delete from ImageKit if it has an ImageKit file ID
      if (file.imageKitFileId) {
        try {
          await this.imageKitService.deleteFile(file.imageKitFileId);
          console.log(`✅ Deleted ImageKit file ${file.imageKitFileId} for ${fileType} (content: ${contentId})`);
        } catch (error: any) {
          console.warn(`⚠️ Failed to delete ImageKit file ${file.imageKitFileId}:`, error.message);
          // Continue with database deletion even if ImageKit deletion fails
        }
      }

      // Delete file record from database
      await this.prisma.contentFile.delete({
        where: { id: file.id },
      });

      console.log(`✅ Deleted database record for file ${file.id} (${file.originalName})`);
    }

    if (existingFiles.length > 0) {
      console.log(
        `🗑️ Deleted ${existingFiles.length} existing ${fileType} file(s) for content ${contentId}`,
      );
    }
  }

  async deleteFile(fileId: string, creatorId: string): Promise<void> {
    // Check if file belongs to content owned by creator
    const file = await this.prisma.contentFile.findUnique({
      where: { id: fileId },
      include: {
        content: true,
      },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (file.content.creatorId !== creatorId) {
      throw new BadRequestException(
        'You can only delete files from your own content',
      );
    }

    // Delete from ImageKit if it has an ImageKit file ID
    if (file.imageKitFileId) {
      try {
        await this.imageKitService.deleteFile(file.imageKitFileId);
        console.log(`Deleted file ${file.imageKitFileId} from ImageKit`);
      } catch (error) {
        console.error('Failed to delete file from ImageKit:', error);
        // Continue with database deletion even if ImageKit deletion fails
      }
    }

    // Delete file record from database
    await this.prisma.contentFile.delete({
      where: { id: fileId },
    });
  }

  // ==================== VIDEO HANDLING METHODS ====================

  /**
   * Save video details to database after ImageKit upload completion
   */
  async saveVideoToDatabase(videoData: {
    fileId: string;
    url: string;
    metadata: any;
    creatorId: string;
  }): Promise<any> {
    try {
      // Create or update content file record for video
      const videoFile = await this.prisma.contentFile.upsert({
        where: {
          // Use a combination of fileId and creatorId as unique identifier
          id: videoData.fileId,
        },
        update: {
          storagePath: videoData.url,
          mimeType: 'video/mp4', // Default, can be updated from metadata
          sizeBytes: BigInt(videoData.metadata?.size || 0),
          imageKitFileId: videoData.fileId,
          imageKitUrl: videoData.url,
        },
        create: {
          id: videoData.fileId,
          contentId: videoData.metadata?.contentId || null,
          fileType: 'VIDEO' as FileType,
          originalName: videoData.metadata?.filename || 'video.mp4',
          storagePath: videoData.url,
          mimeType: videoData.metadata?.mimeType || 'video/mp4',
          sizeBytes: BigInt(videoData.metadata?.size || 0),
          imageKitFileId: videoData.fileId,
          imageKitUrl: videoData.url,
        },
      });

      return videoFile;
    } catch (error) {
      console.error('Error saving video to database:', error);
      throw new BadRequestException('Failed to save video details');
    }
  }

  /**
   * Delete video from database
   */
  async deleteVideoFromDatabase(fileId: string): Promise<void> {
    try {
      await this.prisma.contentFile.deleteMany({
        where: {
          imageKitFileId: fileId,
        },
      });
    } catch (error) {
      console.error('Error deleting video from database:', error);
      throw new BadRequestException('Failed to delete video from database');
    }
  }

  /**
   * Get video details by ImageKit file ID
   */
  async getVideoByImageKitId(fileId: string): Promise<any> {
    try {
      const video = await this.prisma.contentFile.findFirst({
        where: {
          imageKitFileId: fileId,
        },
        include: {
          content: {
            include: {
              creator: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profilePicture: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return video;
    } catch (error) {
      console.error('Error getting video details:', error);
      throw new BadRequestException('Failed to get video details');
    }
  }

  /**
   * Get all videos for a creator
   */
  async getCreatorVideos(creatorId: string): Promise<any[]> {
    try {
      const videos = await this.prisma.contentFile.findMany({
        where: {
          fileType: 'VIDEO',
          content: {
            creatorId: creatorId,
          },
        },
        include: {
          content: {
            select: {
              id: true,
              title: true,
              description: true,
              digitalPrice: true,
              videoPrice: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      });

      return videos;
    } catch (error) {
      console.error('Error getting creator videos:', error);
      throw new BadRequestException('Failed to get creator videos');
    }
  }
}
