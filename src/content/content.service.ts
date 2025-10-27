import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { Content, ContentStatus, Prisma } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Determines the content type (DIGITAL or PHYSICAL) based on content category
   * DIGITAL: video_course, ebook, audio_book, interactive
   * PHYSICAL: textbook, worksheet, assignment, past_questions, notes, tutorial, assessment
   */
  private determineContentType(
    contentCategoryName: string,
  ): 'DIGITAL' | 'PHYSICAL' {
    const digitalCategories = [
      'video_course',
      'ebook',
      'audio_book',
      'interactive',
    ];
    const normalizedCategory = contentCategoryName.toLowerCase().trim();

    if (digitalCategories.includes(normalizedCategory)) {
      return 'DIGITAL';
    }

    return 'PHYSICAL';
  }

  async findCreatorByUserId(userId: string) {
    return this.prisma.creator.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async create(
    createContentDto: CreateContentDto,
    creatorId: string,
  ): Promise<Content> {
    console.log('Content Service - Received creatorId:', creatorId);
    console.log('Content Service - CreateContentDto:', createContentDto);

    // First, check if the creator exists
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
      include: { user: true },
    });

    console.log('Content Service - Found creator:', creator);

    if (!creator) {
      // Let's also check if there are any creators in the database
      const allCreators = await this.prisma.creator.findMany({
        include: { user: true },
      });
      console.log('Content Service - All creators in database:', allCreators);

      throw new Error(
        `Creator with ID ${creatorId} not found. Please ensure you have a valid creator account.`,
      );
    }

    console.log(
      `Creating content for creator: ${creator.user.email} (${creatorId})`,
    );

    // Fetch the content category to determine the content type
    const contentCategory = await this.prisma.contentCategory.findUnique({
      where: { id: createContentDto.contentCategoryId },
    });

    if (!contentCategory) {
      throw new Error(
        `Content category with ID ${createContentDto.contentCategoryId} not found`,
      );
    }

    // Automatically determine contentType based on content category
    const contentType = this.determineContentType(contentCategory.name);
    console.log(
      `Auto-determined contentType: ${contentType} for category: ${contentCategory.name}`,
    );

    return this.prisma.content.create({
      data: {
        ...createContentDto,
        contentType, // Override with auto-determined value
        creatorId,
      },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        contentCategory: true,
        subjectCategory: true,
        files: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ContentWhereUniqueInput;
    where?: Prisma.ContentWhereInput;
    orderBy?: Prisma.ContentOrderByWithRelationInput;
  }): Promise<Content[]> {
    const { skip, take, cursor, where, orderBy } = params;

    // Step 1: Fetch all content items
    const content = await this.prisma.content.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        contentCategory: true,
        subjectCategory: true,
        // Include ALL files so we can prioritize which one to use as thumbnail
        files: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    // Step 2: Process each content item to find the best thumbnail
    const contentWithThumbnails = await Promise.all(
      content.map(async (item) => {
        console.log('=== PROCESSING CONTENT FOR THUMBNAIL (findAll) ===');
        console.log('Content ID:', item.id);
        console.log('Content Title:', item.title);
        console.log('Total files attached:', item.files.length);

        // Get the best thumbnail URL for this content
        const thumbnailUrl = await this.getBestThumbnailUrl(
          item.id,
          item.files,
        );

        // Get video and audio file URLs if they exist
        const videoFile = item.files.find((f) => f.fileType === 'VIDEO_FILE');
        const audioFile = item.files.find((f) => f.fileType === 'AUDIO_FILE');

        console.log('Selected thumbnail URL:', thumbnailUrl);
        console.log(
          'Video file:',
          videoFile
            ? `${videoFile.originalName} (${videoFile.storagePath})`
            : 'None',
        );
        console.log(
          'Audio file:',
          audioFile
            ? `${audioFile.originalName} (${audioFile.storagePath})`
            : 'None',
        );
        console.log('===================================================');

        // Return content with media URLs and without files (to avoid BigInt serialization)
        return {
          ...item,
          thumbnail_url: thumbnailUrl,
          video_url: videoFile ? this.getImageKitUrlOrFallback(videoFile) : null,
          audio_url: audioFile ? this.getImageKitUrlOrFallback(audioFile) : null,
          video_filename: videoFile ? videoFile.originalName : null,
          audio_filename: audioFile ? audioFile.originalName : null,
          // Remove files from response to avoid BigInt serialization issues
          files: undefined,
        };
      }),
    );

    console.log('=== FIND ALL CONTENT RESPONSE SUMMARY ===');
    console.log('Total content items processed:', contentWithThumbnails.length);
    console.log(
      'Content items with thumbnails:',
      contentWithThumbnails.filter((c) => c.thumbnail_url !== null).length,
    );
    console.log(
      'Content items without thumbnails:',
      contentWithThumbnails.filter((c) => c.thumbnail_url === null).length,
    );
    console.log('==========================================');

    return contentWithThumbnails;
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        contentCategory: true,
        subjectCategory: true,
        files: true,
      },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async findByCreator(
    creatorId: string,
    params?: {
      skip?: number;
      take?: number;
      status?: ContentStatus;
    },
  ): Promise<Content[]> {
    const { skip, take, status } = params || {};

    // Step 1: Fetch all content items for this creator
    const content = await this.prisma.content.findMany({
      where: {
        creatorId,
        ...(status && { status }),
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        contentCategory: true,
        subjectCategory: true,
        // Include ALL files so we can prioritize which one to use as thumbnail
        files: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    // Step 2: Process each content item to find the best thumbnail
    const contentWithThumbnails = await Promise.all(
      content.map(async (item) => {
        console.log('=== PROCESSING CONTENT FOR THUMBNAIL ===');
        console.log('Content ID:', item.id);
        console.log('Content Title:', item.title);
        console.log('Content Category:', item.contentCategoryId);
        console.log('Total files attached:', item.files.length);

        // Get the best thumbnail URL for this content
        const thumbnailUrl = await this.getBestThumbnailUrl(
          item.id,
          item.files,
        );

        // Get video and audio file URLs if they exist
        const videoFile = item.files.find((f) => f.fileType === 'VIDEO_FILE');
        const audioFile = item.files.find((f) => f.fileType === 'AUDIO_FILE');

        console.log('Selected thumbnail URL:', thumbnailUrl);
        console.log(
          'Video file:',
          videoFile
            ? `${videoFile.originalName} (${videoFile.storagePath})`
            : 'None',
        );
        console.log(
          'Audio file:',
          audioFile
            ? `${audioFile.originalName} (${audioFile.storagePath})`
            : 'None',
        );
        console.log('========================================');

        // Return content with media URLs and without files (to avoid BigInt serialization)
        return {
          ...item,
          thumbnail_url: thumbnailUrl,
          video_url: videoFile ? this.getImageKitUrlOrFallback(videoFile) : null,
          audio_url: audioFile ? this.getImageKitUrlOrFallback(audioFile) : null,
          video_filename: videoFile ? videoFile.originalName : null,
          audio_filename: audioFile ? audioFile.originalName : null,
          // Remove files from response to avoid BigInt serialization issues
          files: undefined,
        };
      }),
    );

    console.log('=== BACKEND CONTENT RESPONSE SUMMARY ===');
    console.log('Total content items processed:', contentWithThumbnails.length);
    console.log(
      'Content items with thumbnails:',
      contentWithThumbnails.filter((c) => c.thumbnail_url !== null).length,
    );
    console.log(
      'Content items without thumbnails:',
      contentWithThumbnails.filter((c) => c.thumbnail_url === null).length,
    );
    console.log('=========================================');

    return contentWithThumbnails;
  }

  /**
   * Get the best thumbnail URL for a content item.
   * Priority order: THUMBNAIL > PREVIEW_IMAGE > PHYSICAL_IMAGE > any image file
   *
   * @param contentId - The ID of the content
   * @param files - Array of files associated with the content (optional, for performance)
   * @returns The thumbnail URL or null if no suitable image found
   */
  private async getBestThumbnailUrl(
    contentId: string,
    files?: any[],
  ): Promise<string | null> {
    let allFiles = files;

    // If files not provided, fetch them
    if (!allFiles) {
      const contentFiles = await this.prisma.contentFile.findMany({
        where: { contentId },
        orderBy: { uploadedAt: 'desc' },
      });
      allFiles = contentFiles;
    }

    console.log('--- Finding Best Thumbnail ---');
    console.log('Content ID:', contentId);
    console.log('Total files to check:', allFiles?.length || 0);

    if (!allFiles || allFiles.length === 0) {
      console.log('No files found for this content');
      return null;
    }

    // Log all available files and their types
    console.log('Available files:');
    allFiles.forEach((file, index) => {
      console.log(`  File ${index + 1}:`, {
        id: file.id,
        type: file.fileType,
        name: file.originalName,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
      });
    });

    // Priority 1: Look for THUMBNAIL file type
    const thumbnailFile = allFiles.find(
      (file) => file.fileType === 'THUMBNAIL',
    );
    if (thumbnailFile) {
      console.log('✓ Found THUMBNAIL file:', thumbnailFile.originalName);
      return this.getImageKitUrlOrFallback(thumbnailFile);
    }
    console.log('✗ No THUMBNAIL file found');

    // Priority 2: Look for PREVIEW_IMAGE file type
    const previewImageFile = allFiles.find(
      (file) => file.fileType === 'PREVIEW_IMAGE',
    );
    if (previewImageFile) {
      console.log('✓ Found PREVIEW_IMAGE file:', previewImageFile.originalName);
      return this.getImageKitUrlOrFallback(previewImageFile);
    }
    console.log('✗ No PREVIEW_IMAGE file found');

    // Priority 3: Look for PHYSICAL_IMAGE file type
    const physicalImageFile = allFiles.find(
      (file) => file.fileType === 'PHYSICAL_IMAGE',
    );
    if (physicalImageFile) {
      console.log(
        '✓ Found PHYSICAL_IMAGE file:',
        physicalImageFile.originalName,
      );
      return this.getImageKitUrlOrFallback(physicalImageFile);
    }
    console.log('✗ No PHYSICAL_IMAGE file found');

    // Priority 4: Look for any file with image mime type
    const anyImageFile = allFiles.find(
      (file) => file.mimeType && file.mimeType.startsWith('image/'),
    );
    if (anyImageFile) {
      console.log(
        '✓ Found generic image file:',
        anyImageFile.originalName,
        '(type:',
        anyImageFile.fileType + ')',
      );
      return this.getImageKitUrlOrFallback(anyImageFile);
    }
    console.log('✗ No image files found at all');

    // No suitable thumbnail found
    console.log('⚠ No suitable thumbnail found for content:', contentId);
    return null;
  }

  /**
   * Get ImageKit URL if available, otherwise fallback to local file URL
   * 
   * @param file - The file object containing imageKitUrl and storagePath
   * @returns The ImageKit URL or constructed local URL, or null if neither available
   */
  private getImageKitUrlOrFallback(file: any): string | null {
    // Priority 1: Use ImageKit URL if available
    if (file.imageKitUrl) {
      console.log('Using ImageKit URL:', file.imageKitUrl);
      return file.imageKitUrl;
    }

    // Priority 2: Fallback to constructing local URL from storagePath
    if (file.storagePath) {
      console.log('ImageKit URL not available, using local storage path:', file.storagePath);
      return this.constructFileUrl(file.storagePath);
    }

    console.warn('No ImageKit URL or storage path available for file:', file.id);
    return null;
  }

  /**
   * Construct a valid file URL from the storage path.
   * Handles both Windows (\) and Unix (/) path separators.
   *
   * @param storagePath - The file storage path from database
   * @returns The public URL to access the file, or null if path is invalid
   */
  private constructFileUrl(storagePath: string): string | null {
    if (!storagePath) {
      console.warn('Empty storage path provided to constructFileUrl');
      return null;
    }

    // Extract filename from path (handles both \ and / separators)
    const filename = storagePath.split(/[/\\]/).pop();

    if (!filename) {
      console.warn(
        'Could not extract filename from storage path:',
        storagePath,
      );
      return null;
    }

    // Construct the public URL
    const fileUrl = `/images/marketplace/${filename}`;

    console.log(
      'Constructed file URL:',
      fileUrl,
      'from storage path:',
      storagePath,
    );

    return fileUrl;
  }

  async update(
    id: string,
    updateContentDto: UpdateContentDto,
    creatorId: string,
  ): Promise<Content> {
    console.log('Update Service - Content ID:', id);
    console.log('Update Service - Update DTO:', updateContentDto);
    console.log('Update Service - Creator ID:', creatorId);

    // Check if content exists and belongs to the creator
    const existingContent = await this.findOne(id);
    console.log('Update Service - Existing content:', existingContent);

    if (existingContent.creatorId !== creatorId) {
      console.log(
        'Update Service - Creator ID mismatch, throwing ForbiddenException',
      );
      throw new ForbiddenException('You can only update your own content');
    }

    console.log('Update Service - Proceeding with update');
    console.log(
      'Update Service - Data being sent to Prisma:',
      JSON.stringify(updateContentDto, null, 2),
    );

    // Log the exact Prisma operation
    console.log('=== PRISMA UPDATE OPERATION DEBUG ===');
    console.log('Where clause:', { id });
    console.log('Data being updated:', updateContentDto);
    console.log(
      'Textbook Author field in data:',
      updateContentDto.textbookAuthor,
    );
    console.log(
      'Textbook Publisher field in data:',
      updateContentDto.textbookPublisher,
    );
    console.log('Textbook Year field in data:', updateContentDto.textbookYear);
    console.log('=====================================');

    const result = await this.prisma.content.update({
      where: { id },
      data: updateContentDto,
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        contentCategory: true,
        subjectCategory: true,
        // Exclude files to avoid BigInt serialization issues
        // files: true,
      },
    });

    console.log('Update Service - Update result:', result);
    return result;
  }

  async remove(id: string, creatorId: string): Promise<Content> {
    // Check if content exists and belongs to the creator
    const existingContent = await this.prisma.content.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        contentCategory: true,
        subjectCategory: true,
        files: true,
      },
    });

    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    if (existingContent.creatorId !== creatorId) {
      throw new ForbiddenException('You can only delete your own content');
    }

    return this.prisma.content.delete({
      where: { id },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        contentCategory: true,
        subjectCategory: true,
        files: true,
      },
    });
  }

  async uploadFile(uploadFileDto: UploadFileDto): Promise<any> {
    return this.prisma.contentFile.create({
      data: uploadFileDto,
    });
  }

  async getContentFiles(contentId: string): Promise<any[]> {
    return this.prisma.contentFile.findMany({
      where: { contentId },
    });
  }

  async deleteFile(fileId: string, creatorId: string): Promise<any> {
    // First check if the file belongs to content owned by the creator
    const file = await this.prisma.contentFile.findUnique({
      where: { id: fileId },
      include: {
        content: true,
      },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    if (file.content.creatorId !== creatorId) {
      throw new ForbiddenException(
        'You can only delete files from your own content',
      );
    }

    return this.prisma.contentFile.delete({
      where: { id: fileId },
    });
  }

  // Category management methods
  async getContentCategories() {
    return this.prisma.contentCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getSubjectCategories() {
    return this.prisma.subjectCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createContentCategory(name: string, description?: string) {
    return this.prisma.contentCategory.create({
      data: { name, description },
    });
  }

  async createSubjectCategory(name: string, description?: string) {
    return this.prisma.subjectCategory.create({
      data: { name, description },
    });
  }

  // Analytics methods
  async incrementViewCount(contentId: string): Promise<void> {
    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async incrementDownloadCount(contentId: string): Promise<void> {
    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  async incrementSalesCount(contentId: string): Promise<void> {
    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        salesCount: {
          increment: 1,
        },
      },
    });
  }
}
