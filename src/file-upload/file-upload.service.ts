import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';
import { ImageKitService } from '../imagekit/imagekit.service';

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

    // Step 2: Upload to ImageKit instead of local storage
    const imageKitResult = await this.uploadToImageKit(file, contentId, fileType);

    // Step 3: Create new file record in database with ImageKit URL
    const fileRecord = await this.prisma.contentFile.create({
      data: {
        contentId,
        fileType,
        originalName: file.originalname,
        storagePath: imageKitResult.url, // ImageKit URL instead of local path
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        imageKitFileId: imageKitResult.fileId,
        imageKitUrl: imageKitResult.url,
      },
    });

    return {
      id: fileRecord.id,
      originalName: fileRecord.originalName,
      url: imageKitResult.url, // ImageKit URL
      mimeType: fileRecord.mimeType,
      size: Number(fileRecord.sizeBytes),
      fileType: fileRecord.fileType,
      imageKitFileId: imageKitResult.fileId,
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
      const uploadResult = await this.imageKitService.uploadFile({
        file: file.buffer,
        fileName: file.originalname,
        folder: `content/${contentId}/${fileType.toLowerCase()}`,
        useUniqueFileName: true,
        tags: [fileType.toLowerCase(), contentId],
        customMetadata: {
          contentId,
          fileType,
          originalName: file.originalname,
        },
      });

      return {
        fileId: uploadResult.fileId,
        url: uploadResult.url,
      };
    } catch (error) {
      console.error('ImageKit upload failed:', error);
      throw new BadRequestException(`Failed to upload file to ImageKit: ${error.message}`);
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

    // Delete each existing file record
    for (const file of existingFiles) {
      await this.prisma.contentFile.delete({
        where: { id: file.id },
      });

      // In production, you would also delete the actual file from storage here
      // Example: fs.unlinkSync(file.storagePath);
    }

    if (existingFiles.length > 0) {
      console.log(
        `Deleted ${existingFiles.length} existing ${fileType} file(s) for content ${contentId}`,
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
