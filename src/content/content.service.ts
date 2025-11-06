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
   * Determines the content type (DIGITAL or PHYSICAL) based on content category and delivery method
   * 
   * DIGITAL if:
   * - Explicitly set to DIGITAL in DTO
   * - Category is inherently digital (video_course, ebook, audio_book, interactive)
   * - Has digitalDeliveryMethod set
   * - Has digitalPrice > 0
   * 
   * PHYSICAL if:
   * - Explicitly set to PHYSICAL in DTO
   * - Category is textbook/worksheet/assignment/etc. AND no digital indicators
   */
  private determineContentType(
    contentCategoryName: string,
    createContentDto?: CreateContentDto,
  ): 'DIGITAL' | 'PHYSICAL' {
    const digitalCategories = [
      'video_course',
      'ebook',
      'audio_book',
      'interactive',
    ];
    const normalizedCategory = contentCategoryName.toLowerCase().trim();

    // Priority 1: If explicitly set in DTO, respect it (for both DIGITAL and PHYSICAL)
    if (createContentDto?.contentType) {
      return createContentDto.contentType;
    }

    // Priority 2: If category is inherently digital, return DIGITAL
    if (digitalCategories.includes(normalizedCategory)) {
      return 'DIGITAL';
    }

    // Priority 3: If digitalDeliveryMethod is set, this is digital content
    if (createContentDto?.digitalDeliveryMethod) {
      return 'DIGITAL';
    }

    // Priority 4: If digitalPrice is set, this is digital content
    if (createContentDto?.digitalPrice && createContentDto.digitalPrice > 0) {
      return 'DIGITAL';
    }

    // Priority 5: Default to PHYSICAL for categories like textbook, worksheet, etc.
    // (These can be made digital by setting digitalDeliveryMethod or digitalPrice above)
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
    console.log('🔍 CREATING CONTENT - Category resolution:');
    console.log('  - Received contentCategoryId:', createContentDto.contentCategoryId);
    console.log('  - Received content_category (string):', (createContentDto as any).content_category);
    
    const contentCategory = await this.prisma.contentCategory.findUnique({
      where: { id: createContentDto.contentCategoryId },
    });

    if (!contentCategory) {
      console.error('  ❌ Content category not found!');
      throw new Error(
        `Content category with ID ${createContentDto.contentCategoryId} not found`,
      );
    }
    
    console.log('  ✅ Found category:', { id: contentCategory.id, name: contentCategory.name });
    console.log('  - This category will be stored in database as contentCategoryId');
    console.log('  - VERIFY: contentCategoryId to be stored:', createContentDto.contentCategoryId);
    console.log('  - VERIFY: Category name matches:', contentCategory.name);
    
    // CRITICAL: Verify the ID matches
    if (createContentDto.contentCategoryId !== contentCategory.id) {
      console.error('  ⚠️ WARNING: contentCategoryId mismatch!');
      console.error('    - Received ID:', createContentDto.contentCategoryId);
      console.error('    - Resolved ID:', contentCategory.id);
      console.error('    - Category name:', contentCategory.name);
    }

    // Automatically determine contentType based on content category and delivery method
    // If contentType is explicitly provided in DTO, use it; otherwise auto-determine
    const contentType = createContentDto.contentType 
      ? createContentDto.contentType 
      : this.determineContentType(contentCategory.name, createContentDto);
    
    const contentTypeSource = createContentDto.contentType 
      ? 'explicitly set in request' 
      : createContentDto.digitalDeliveryMethod 
        ? 'auto-detected (has digitalDeliveryMethod)' 
        : (createContentDto.digitalPrice && createContentDto.digitalPrice > 0)
          ? 'auto-detected (has digitalPrice)'
          : 'auto-detected (category default)';
    
    console.log(
      `✓ Content type determined: ${contentType} for category: ${contentCategory.name} (${contentTypeSource})`,
      createContentDto.digitalDeliveryMethod ? `\n  digitalDeliveryMethod: ${createContentDto.digitalDeliveryMethod}` : '',
      (createContentDto.digitalPrice && createContentDto.digitalPrice > 0) ? `\n  digitalPrice: ${createContentDto.digitalPrice}` : '',
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

    // DEBUG: Log raw Prisma results for ebook content specifically
    console.log('=== RAW PRISMA QUERY RESULTS ===');
    console.log('Total items:', content.length);
    const ebookItem = content.find((item: any) => 
      item.contentCategoryId && 
      item.contentCategory?.name === 'ebook'
    );
    if (ebookItem) {
      console.log('📚 Found ebook item:', ebookItem.id);
      console.log('  - contentCategoryId:', ebookItem.contentCategoryId);
      console.log('  - contentCategory object:', JSON.stringify(ebookItem.contentCategory, null, 2));
      console.log('  - contentCategory type:', typeof ebookItem.contentCategory);
    } else {
      console.log('⚠️ No ebook item found in query results');
      // Log all category IDs to debug
      content.forEach((item: any) => {
        console.log(`  - Item ${item.id}: contentCategoryId=${item.contentCategoryId}, category=${item.contentCategory?.name || item.contentCategory || 'N/A'}`);
      });
    }
    console.log('================================');

    // Step 2: Process each content item to find the best thumbnail
    const contentWithThumbnails = await Promise.all(
      content.map(async (item) => {
        console.log('=== PROCESSING CONTENT FOR THUMBNAIL ===');
        console.log('Content ID:', item.id);
        console.log('Content Title:', item.title);
        console.log('Content Category ID:', item.contentCategoryId);
        console.log('Content Category Relation:', item.contentCategory);
        console.log('Content Category Type:', typeof item.contentCategory);
        if (item.contentCategory && typeof item.contentCategory === 'object') {
          console.log('Content Category Name:', item.contentCategory.name);
          // Note: ContentCategory model doesn't have a slug field
        }
        console.log('Total files attached:', item.files.length);
        
        // Log ALL files with their types
        console.log('📁 All files from Prisma query:');
        item.files.forEach((file: any, idx: number) => {
          console.log(`  [${idx + 1}] ID: ${file.id}, Type: ${file.fileType}, Name: ${file.originalName}`);
        });

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
        // IMPORTANT: Preserve the contentCategory relation object, don't let string fields override it
        const responseItem: any = {
          ...item,
          thumbnail_url: thumbnailUrl,
          video_url: videoFile ? this.getImageKitUrlOrFallback(videoFile) : null,
          audio_url: audioFile ? this.getImageKitUrlOrFallback(audioFile) : null,
          video_filename: videoFile ? videoFile.originalName : null,
          audio_filename: audioFile ? audioFile.originalName : null,
          // Remove files from response to avoid BigInt serialization issues
          files: undefined,
        };

        // CRITICAL: Ensure contentCategory relation is preserved as an object, not a string
        // If item.contentCategory is an object (relation), keep it
        // Remove any string fields that might have been added accidentally
        if (item.contentCategory && typeof item.contentCategory === 'object') {
          responseItem.contentCategory = item.contentCategory;
          // Remove any string versions that might override it
          delete (responseItem as any).content_category;
        } else {
          console.warn('⚠️ contentCategory relation missing for content:', item.id);
        }

        console.log('✅ Final responseItem.contentCategory:', responseItem.contentCategory);
        return responseItem;
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
        hasImageKitUrl: !!(file.imageKitUrl && file.imageKitUrl.includes('imagekit.io')),
        imageKitUrl: file.imageKitUrl ? file.imageKitUrl.substring(0, 80) + '...' : 'None',
        imageKitFileId: file.imageKitFileId || 'None',
        storagePath: file.storagePath ? (file.storagePath.substring(0, 50) + '...') : 'None',
      });
    });
    
    // Count files by type
    const filesByType = allFiles.reduce((acc: any, file: any) => {
      acc[file.fileType] = (acc[file.fileType] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Files by type:', filesByType);
    
    // Specifically check for THUMBNAIL files
    const thumbnailCount = allFiles.filter(f => f.fileType === 'THUMBNAIL').length;
    console.log(`📸 Total THUMBNAIL files found: ${thumbnailCount}`);
    if (thumbnailCount > 0) {
      const thumbnailIds = allFiles.filter(f => f.fileType === 'THUMBNAIL').map(f => f.id);
      console.log(`   THUMBNAIL file IDs:`, thumbnailIds);
    }

    // Priority 1: Look for THUMBNAIL file type
    // Find all thumbnail files, prioritize those with valid ImageKit URLs
    const thumbnailFiles = allFiles.filter(
      (file) => {
        const isThumbnail = file.fileType === 'THUMBNAIL';
        if (!isThumbnail && file.fileType) {
          // Log files that aren't THUMBNAIL to see what types we have
          console.log(`  ⚠️ File ${file.id} has fileType: "${file.fileType}" (not THUMBNAIL)`);
        }
        return isThumbnail;
      },
    );
    
    if (thumbnailFiles.length > 0) {
      console.log(`📋 Found ${thumbnailFiles.length} THUMBNAIL file(s):`);
      thumbnailFiles.forEach((file, index) => {
        console.log(`  Thumbnail ${index + 1}:`, {
          id: file.id,
          originalName: file.originalName,
          uploadedAt: file.uploadedAt,
          imageKitUrl: file.imageKitUrl || 'None',
          imageKitFileId: file.imageKitFileId || 'None',
          storagePath: file.storagePath || 'None',
          hasImageKitUrl: !!(file.imageKitUrl && file.imageKitUrl.includes('imagekit.io')),
        });
      });
      
      // Sort by uploadedAt desc (newest first) and prioritize files with ImageKit URLs
      thumbnailFiles.sort((a, b) => {
        // First, prioritize files with ImageKit URLs
        const aHasImageKit = a.imageKitUrl && a.imageKitUrl.includes('imagekit.io');
        const bHasImageKit = b.imageKitUrl && b.imageKitUrl.includes('imagekit.io');
        
        if (aHasImageKit && !bHasImageKit) {
          console.log(`  → Prioritizing file ${a.originalName} (has ImageKit URL)`);
          return -1;
        }
        if (!aHasImageKit && bHasImageKit) {
          console.log(`  → Prioritizing file ${b.originalName} (has ImageKit URL)`);
          return 1;
        }
        
        // If both have or both don't have ImageKit URLs, sort by upload date (newest first)
        const dateDiff = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        if (dateDiff !== 0) {
          console.log(`  → Sorting by date: ${b.originalName} (newer) vs ${a.originalName} (older)`);
        }
        return dateDiff;
      });
      
      // Try each thumbnail file in order until we find one that works
      for (let i = 0; i < thumbnailFiles.length; i++) {
        const thumbnailFile = thumbnailFiles[i];
        console.log(`🔍 Trying THUMBNAIL file ${i + 1}/${thumbnailFiles.length}:`, thumbnailFile.originalName);
        console.log('  - File ID:', thumbnailFile.id);
        console.log('  - ImageKit URL:', thumbnailFile.imageKitUrl || 'None');
        console.log('  - ImageKit File ID:', thumbnailFile.imageKitFileId || 'None');
        console.log('  - Storage Path:', thumbnailFile.storagePath || 'None');
        console.log('  - Uploaded At:', thumbnailFile.uploadedAt);
        
        const resultUrl = this.getImageKitUrlOrFallback(thumbnailFile);
        
        if (resultUrl) {
          console.log(`✅ Using THUMBNAIL file ${i + 1}:`, thumbnailFile.originalName);
          console.log('  - Final URL returned:', resultUrl);
          return resultUrl;
        } else {
          console.warn(`⚠️ THUMBNAIL file ${i + 1} returned null URL, trying next file...`);
        }
      }
      
      console.warn('❌ All thumbnail files failed to return a valid URL');
      return null;
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
    const physicalImageFiles = allFiles.filter(
      (file) => file.fileType === 'PHYSICAL_IMAGE',
    );
    
    if (physicalImageFiles.length > 0) {
      console.log(`📋 Found ${physicalImageFiles.length} PHYSICAL_IMAGE file(s):`);
      physicalImageFiles.forEach((file, index) => {
        console.log(`  Physical Image ${index + 1}:`, {
          id: file.id,
          originalName: file.originalName,
          uploadedAt: file.uploadedAt,
          imageKitUrl: file.imageKitUrl || 'None',
          imageKitFileId: file.imageKitFileId || 'None',
          storagePath: file.storagePath || 'None',
          hasImageKitUrl: !!(file.imageKitUrl && file.imageKitUrl.includes('imagekit.io')),
        });
      });
      
      // Sort by uploadedAt desc (newest first) and prioritize files with ImageKit URLs
      physicalImageFiles.sort((a, b) => {
        const aHasImageKit = a.imageKitUrl && a.imageKitUrl.includes('imagekit.io');
        const bHasImageKit = b.imageKitUrl && b.imageKitUrl.includes('imagekit.io');
        
        if (aHasImageKit && !bHasImageKit) {
          console.log(`  → Prioritizing file ${a.originalName} (has ImageKit URL)`);
          return -1;
        }
        if (!aHasImageKit && bHasImageKit) {
          console.log(`  → Prioritizing file ${b.originalName} (has ImageKit URL)`);
          return 1;
        }
        
        const dateDiff = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        if (dateDiff !== 0) {
          console.log(`  → Sorting by date: ${b.originalName} (newer) vs ${a.originalName} (older)`);
        }
        return dateDiff;
      });

      for (let i = 0; i < physicalImageFiles.length; i++) {
        const physicalImageFile = physicalImageFiles[i];
        console.log(`🔍 Trying PHYSICAL_IMAGE file ${i + 1}/${physicalImageFiles.length}:`, physicalImageFile.originalName);
        console.log('  - File ID:', physicalImageFile.id);
        console.log('  - ImageKit URL:', physicalImageFile.imageKitUrl || 'None');
        console.log('  - ImageKit File ID:', physicalImageFile.imageKitFileId || 'None');
        console.log('  - Storage Path:', physicalImageFile.storagePath || 'None');
        console.log('  - Uploaded At:', physicalImageFile.uploadedAt);
        
        const resultUrl = this.getImageKitUrlOrFallback(physicalImageFile);
        if (resultUrl) {
          console.log(`✅ Using PHYSICAL_IMAGE file ${i + 1}:`, physicalImageFile.originalName);
          console.log('  - Final URL returned:', resultUrl);
          return resultUrl;
        } else {
          console.warn(`⚠️ PHYSICAL_IMAGE file ${i + 1} returned null URL, trying next file...`);
        }
      }
      console.warn('❌ All physical image files failed to return a valid URL');
      return null;
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
    console.log('🔍 getImageKitUrlOrFallback called for file:', file.id);
    console.log('  - Original Name:', file.originalName);
    console.log('  - imageKitUrl:', file.imageKitUrl || 'null');
    console.log('  - imageKitFileId:', file.imageKitFileId || 'null');
    console.log('  - storagePath:', file.storagePath || 'null');
    
    // Priority 1: Use ImageKit URL if available and valid
    if (file.imageKitUrl) {
      // Validate ImageKit URL format - ensure it's complete and valid
      const imageKitUrl = file.imageKitUrl.trim();
      console.log('  - Checking imageKitUrl validity:', imageKitUrl);
      
      if (imageKitUrl.startsWith('http') && imageKitUrl.includes('imagekit.io')) {
        // Check if URL is complete (not truncated) - should have proper structure
        const urlParts = imageKitUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        console.log('  - URL parts:', urlParts.length, 'parts');
        console.log('  - Filename:', fileName);
        
        // Valid ImageKit URLs should have a filename with extension
        if (fileName && fileName.includes('.') && fileName.length > 5) {
          console.log('✅ Using ImageKit URL:', imageKitUrl);
          console.log('  - URL length:', imageKitUrl.length);
          console.log('  - Filename length:', fileName.length);
          return imageKitUrl;
        } else {
          console.warn('⚠️ ImageKit URL appears incomplete (missing filename):', imageKitUrl);
          console.warn('  - Filename check failed:', { fileName, hasDot: fileName?.includes('.'), length: fileName?.length });
          // Fall through to check storagePath
        }
      } else {
        console.warn('⚠️ Invalid ImageKit URL format:', imageKitUrl);
        console.warn('  - Starts with http:', imageKitUrl.startsWith('http'));
        console.warn('  - Contains imagekit.io:', imageKitUrl.includes('imagekit.io'));
        // Fall through to check storagePath
      }
    } else {
      console.log('  - No imageKitUrl field');
    }

    // Priority 2: Fallback to constructing local URL from storagePath
    if (file.storagePath) {
      console.log('  - Checking storagePath:', file.storagePath);
      
      // If storagePath is already an ImageKit URL, check if it's different from imageKitUrl
      // If imageKitUrl already failed validation, don't try storagePath if it's also an ImageKit URL
      if (file.storagePath.startsWith('http') && file.storagePath.includes('imagekit.io')) {
        const urlParts = file.storagePath.split('/');
        const fileName = urlParts[urlParts.length - 1];
        console.log('  - storagePath is ImageKit URL');
        console.log('  - Filename:', fileName);
        
        // If imageKitUrl exists but was invalid, and storagePath is also ImageKit URL,
        // they're likely both invalid (old file scenario). Only use storagePath if it's different.
        if (file.imageKitUrl && file.imageKitUrl === file.storagePath) {
          console.warn('⚠️ storagePath is same as invalid imageKitUrl, skipping ImageKit URL');
          // Don't return ImageKit URL - will fall through to try local file if available
        } else if (fileName && fileName.includes('.') && fileName.length > 5) {
          console.log('✅ Using storagePath as ImageKit URL:', file.storagePath);
          return file.storagePath;
        } else {
          console.warn('⚠️ storagePath ImageKit URL appears invalid:', file.storagePath);
        }
      }
      
      // Only try local storage if storagePath is NOT an ImageKit URL
      if (!file.storagePath.startsWith('http') || !file.storagePath.includes('imagekit.io')) {
        console.log('  - Falling back to local storage path:', file.storagePath);
        const localUrl = this.constructFileUrl(file.storagePath);
        console.log('  - Constructed local URL:', localUrl);
        return localUrl;
      } else {
        console.warn('⚠️ storagePath is ImageKit URL but imageKitUrl failed, no local fallback available');
      }
    }

    console.warn('❌ No ImageKit URL or storage path available for file:', file.id);
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
    console.log('🔧 constructFileUrl called with storagePath:', storagePath);
    
    if (!storagePath) {
      console.warn('⚠️ Empty storage path provided to constructFileUrl');
      return null;
    }

    // If storagePath is already a URL path (starts with /images/), return it as is
    if (storagePath.startsWith('/images/')) {
      console.log('✅ storagePath is already a URL path, returning as is:', storagePath);
      return storagePath;
    }

    // Extract filename and path parts (handles both \ and / separators)
    const pathParts = storagePath.split(/[/\\]/);
    const filename = pathParts[pathParts.length - 1];

    if (!filename) {
      console.warn(
        '⚠️ Could not extract filename from storage path:',
        storagePath,
      );
      return null;
    }

    // Check if this is a new file structure: uploads/content/{contentId}/{fileType}/{filename}
    // or old structure: uploads/marketplace/{filename}
    const uploadsIndex = pathParts.findIndex(part => part === 'uploads');
    if (uploadsIndex !== -1 && uploadsIndex < pathParts.length - 1) {
      const nextPart = pathParts[uploadsIndex + 1];
      
      if (nextPart === 'content' && pathParts.length >= uploadsIndex + 4) {
        // New structure: uploads/content/{contentId}/{fileType}/{filename}
        const contentId = pathParts[uploadsIndex + 2];
        const fileType = pathParts[uploadsIndex + 3];
        const fileUrl = `/images/content/${contentId}/${fileType}/${filename}`;
        console.log('✅ Constructed file URL from new structure:', fileUrl);
        return fileUrl;
      } else if (nextPart === 'marketplace') {
        // Old structure: uploads/marketplace/{filename}
        const fileUrl = `/images/marketplace/${filename}`;
        console.log('✅ Constructed file URL from old marketplace structure:', fileUrl);
        return fileUrl;
      }
    }

    // Fallback: assume old marketplace structure
    const fileUrl = `/images/marketplace/${filename}`;

    console.log(
      '✅ Constructed file URL (fallback):',
      fileUrl,
      'from storage path:',
      storagePath,
    );
    console.log('  - Extracted filename:', filename);
    console.log('  - Final URL will be:', `${process.env.API_BASE_URL || 'http://localhost:3001'}${fileUrl}`);

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
