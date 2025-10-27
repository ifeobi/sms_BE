import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceCategory } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Publish content to marketplace by creating a MarketplaceItem
   */
  async publishToMarketplace(contentId: string, creatorId: string) {
    console.log('Publishing to marketplace:', { contentId, creatorId });

    // 1. First check if content exists and belongs to creator
    const content = await this.prisma.content.findFirst({
      where: {
        id: contentId,
        creatorId: creatorId,
      },
      include: {
        contentCategory: true,
        subjectCategory: true,
        creator: {
          include: {
            user: true,
          },
        },
        files: true,
      },
    });

    if (!content) {
      throw new NotFoundException(
        'Content not found or you do not have permission to publish it',
      );
    }

    console.log('Content found:', {
      id: content.id,
      title: content.title,
      status: content.status,
    });

    // 2. Check if content is published - with retry logic for race conditions
    if (content.status !== 'PUBLISHED') {
      console.log(
        `Content status is ${content.status}, waiting and retrying...`,
      );

      // Wait a moment and check again in case of race condition
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const retryContent = await this.prisma.content.findFirst({
        where: {
          id: contentId,
          creatorId: creatorId,
        },
        select: {
          id: true,
          title: true,
          status: true,
        },
      });

      if (!retryContent || retryContent.status !== 'PUBLISHED') {
        throw new NotFoundException(
          `Content must be published first. Current status: ${retryContent?.status || 'UNKNOWN'}`,
        );
      }

      console.log('Content status verified as PUBLISHED after retry');
    }

    // 3. Check if already exists in marketplace
    const existingMarketplaceItem = await this.prisma.marketplaceItem.findFirst(
      {
        where: {
          contentId: contentId, // Now using contentId after migration
        },
      },
    );

    if (existingMarketplaceItem) {
      console.log(
        'Content already in marketplace:',
        existingMarketplaceItem.id,
      );
      throw new Error('This content is already published to the marketplace');
    }

    // 4. Map content category to marketplace category
    const marketplaceCategory = this.mapContentCategoryToMarketplaceCategory(
      content.contentCategory?.name || 'textbook',
    );
    console.log('Marketplace category:', marketplaceCategory);

    // 5. Determine the price based on content type and category
    const price = this.determinePrice(content);
    console.log('Determined price:', price);

    // 6. Get the best thumbnail URL
    const thumbnailUrl = await this.getBestThumbnailUrl(content.files);
    console.log('Thumbnail URL:', thumbnailUrl);

    // 7. Create marketplace item
    const marketplaceItemData = {
      contentId: contentId, // Link to source content
      title: content.title,
      description: content.description,
      price: price,
      currency: content.currency || 'NGN',
      category: marketplaceCategory,
      creatorId: creatorId,
      thumbnailUrl: thumbnailUrl,
      tags: this.extractTags(content),
      isActive: true,
      isFeatured: false,
      isRecommended: false,
      commissionRate: 0.1, // 10% commission
      totalRevenue: 0, // Initialize total revenue to 0
    };

    console.log('Creating marketplace item with data:', marketplaceItemData);

    const marketplaceItem = await this.prisma.marketplaceItem.create({
      data: marketplaceItemData,
    });

    // Update content to track marketplace publication
    await this.prisma.content.update({
      where: { id: contentId },
      data: {
        marketplacePublishedAt: new Date(),
      },
    });

    console.log('Marketplace item created successfully:', marketplaceItem.id);
    return marketplaceItem;
  }

  /**
   * Remove content from marketplace
   */
  async unpublishFromMarketplace(contentId: string, creatorId: string) {
    // Find the content first
    const content = await this.prisma.content.findFirst({
      where: {
        id: contentId,
        creatorId: creatorId,
      },
    });

    if (!content) {
      throw new NotFoundException(
        'Content not found or you do not have permission to unpublish it',
      );
    }

    // Find and delete the marketplace item
    const marketplaceItem = await this.prisma.marketplaceItem.findFirst({
      where: {
        contentId: contentId, // Now using contentId after migration
      },
    });

    if (marketplaceItem) {
      await this.prisma.marketplaceItem.delete({
        where: {
          id: marketplaceItem.id,
        },
      });

      // Update content to track marketplace unpublishing
      await this.prisma.content.update({
        where: { id: contentId },
        data: {
          marketplaceUnpublishedAt: new Date(),
        },
      });
    }

    return { message: 'Content removed from marketplace successfully' };
  }

  /**
   * Get a single marketplace item by ID
   */
  async getMarketplaceItemById(id: string) {
    const item = await this.prisma.marketplaceItem.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profilePicture: true,
                isActive: true,
              },
            },
          },
        },
        content: {
          include: {
            files: true, // Include files to get all images
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Marketplace item not found');
    }

    // Get all image URLs from content files
    const images = this.getAllImageUrls(item.content?.files || []);
    
    // Get video URL from content files
    const videoUrl = this.getVideoUrl(item.content?.files || []);
    
    console.log('=== MARKETPLACE ITEM BY ID DEBUG ===');
    console.log('Item ID:', item.id);
    console.log('Item category:', item.category);
    console.log('Content files count:', item.content?.files?.length || 0);
    console.log('Video URL extracted:', videoUrl);
    console.log('=====================================');

    return {
      ...item,
      images, // Add array of all image URLs
      videoUrl, // Add video URL
    };
  }

  /**
   * Get all marketplace items
   */
  async getMarketplaceItems(params?: {
    skip?: number;
    take?: number;
    category?: string;
    search?: string;
  }) {
    const { skip = 0, take = 10, category, search } = params || {};

    const where: any = {
      isActive: true,
    };

    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    console.log('Fetching marketplace items with params:', { skip, take, category, search });
    
    const [items, total] = await Promise.all([
      this.prisma.marketplaceItem.findMany({
        where,
        skip,
        take,
        include: {
          creator: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  profilePicture: true,
                  isActive: true,
                },
              },
            },
          },
          content: true, // Include content to access physicalCondition and deliveryMethods
        },
        orderBy: {
          dateCreated: 'desc',
        },
      }),
      this.prisma.marketplaceItem.count({ where }),
    ]);

    console.log('Found marketplace items:', items.length, 'Total:', total);

    // Process items to include video URLs (for now, set to null since we're not including files in the list query)
    const processedItems = items.map(item => {
      return {
        ...item,
        videoUrl: null, // Will be fetched separately for individual items
      };
    });

    return {
      items: processedItems,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Map content category to marketplace category
   */
  private mapContentCategoryToMarketplaceCategory(
    contentCategory: string,
  ): MarketplaceCategory {
    const mapping: Record<string, MarketplaceCategory> = {
      textbook: MarketplaceCategory.TEXTBOOK,
      ebook: MarketplaceCategory.TEXTBOOK,
      video_course: MarketplaceCategory.VIDEO_COURSE,
      audio_book: MarketplaceCategory.AUDIO_BOOK,
      worksheet: MarketplaceCategory.WORKSHEET,
      assignment: MarketplaceCategory.ASSIGNMENT,
      past_questions: MarketplaceCategory.PAST_QUESTIONS,
      notes: MarketplaceCategory.NOTES,
      interactive: MarketplaceCategory.INTERACTIVE,
      assessment: MarketplaceCategory.ASSESSMENT,
      tutorial: MarketplaceCategory.TUTORIAL,
    };

    return mapping[contentCategory] || MarketplaceCategory.TEXTBOOK;
  }

  /**
   * Determine price based on content type and category
   */
  private determinePrice(content: any): number {
    // Priority order for pricing
    if (content.digitalPrice && content.digitalPrice > 0) {
      return content.digitalPrice;
    }
    if (content.textbookPrice && content.textbookPrice > 0) {
      return content.textbookPrice;
    }
    if (content.videoPrice && content.videoPrice > 0) {
      return content.videoPrice;
    }
    if (content.worksheetPrice && content.worksheetPrice > 0) {
      return content.worksheetPrice;
    }
    if (content.assignmentPrice && content.assignmentPrice > 0) {
      return content.assignmentPrice;
    }
    if (content.pastQuestionsPrice && content.pastQuestionsPrice > 0) {
      return content.pastQuestionsPrice;
    }
    if (content.audiobookPrice && content.audiobookPrice > 0) {
      return content.audiobookPrice;
    }
    if (content.interactivePrice && content.interactivePrice > 0) {
      return content.interactivePrice;
    }
    if (content.notesPrice && content.notesPrice > 0) {
      return content.notesPrice;
    }
    if (content.ebookPrice && content.ebookPrice > 0) {
      return content.ebookPrice;
    }

    // Default price if none specified
    return 0;
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: any): string[] {
    const tags: string[] = [];

    // Add content category as tag
    if (content.contentCategory?.name) {
      tags.push(content.contentCategory.name);
    }

    // Add subject category as tag
    if (content.subjectCategory?.name) {
      tags.push(content.subjectCategory.name);
    }

    // Add content type as tag
    if (content.contentType) {
      tags.push(content.contentType.toLowerCase());
    }

    // Add specific content tags if they exist
    if (content.tags && Array.isArray(content.tags)) {
      tags.push(...content.tags);
    }

    // Add category-specific tags
    if (
      content.contentCategory?.name === 'textbook' &&
      content.textbookAuthor
    ) {
      tags.push(`author:${content.textbookAuthor}`);
    }
    if (content.contentCategory?.name === 'video_course' && content.videoTags) {
      tags.push(
        ...content.videoTags.split(',').map((tag: string) => tag.trim()),
      );
    }
    if (
      content.contentCategory?.name === 'worksheet' &&
      content.worksheetTags
    ) {
      tags.push(
        ...content.worksheetTags.split(',').map((tag: string) => tag.trim()),
      );
    }
    if (
      content.contentCategory?.name === 'assignment' &&
      content.assignmentTags
    ) {
      tags.push(
        ...content.assignmentTags.split(',').map((tag: string) => tag.trim()),
      );
    }
    if (
      content.contentCategory?.name === 'past_questions' &&
      content.pastQuestionsTags
    ) {
      tags.push(
        ...content.pastQuestionsTags
          .split(',')
          .map((tag: string) => tag.trim()),
      );
    }
    if (
      content.contentCategory?.name === 'audio_book' &&
      content.audiobookTags
    ) {
      tags.push(
        ...content.audiobookTags.split(',').map((tag: string) => tag.trim()),
      );
    }
    if (
      content.contentCategory?.name === 'interactive' &&
      content.interactiveTags
    ) {
      tags.push(
        ...content.interactiveTags.split(',').map((tag: string) => tag.trim()),
      );
    }
    if (content.contentCategory?.name === 'notes' && content.notesTags) {
      tags.push(
        ...content.notesTags.split(',').map((tag: string) => tag.trim()),
      );
    }

    // Remove duplicates and empty strings
    return [...new Set(tags.filter((tag) => tag && tag.trim().length > 0))];
  }

  /**
   * Get the best thumbnail URL from content files
   */
  private async getBestThumbnailUrl(files: any[]): Promise<string | null> {
    if (!files || files.length === 0) {
      return null;
    }

    // Look for thumbnail files first
    const thumbnailFile = files.find((f) => f.fileType === 'THUMBNAIL');
    if (thumbnailFile) {
      return thumbnailFile.imageKitUrl || (thumbnailFile.storagePath ? `/images/marketplace/${this.getFileNameFromPath(thumbnailFile.storagePath)}` : null);
    }

    // Look for preview images
    const previewFile = files.find((f) => f.fileType === 'PREVIEW_IMAGE');
    if (previewFile) {
      return previewFile.imageKitUrl || (previewFile.storagePath ? `/images/marketplace/${this.getFileNameFromPath(previewFile.storagePath)}` : null);
    }

    // Look for physical images
    const physicalImageFile = files.find(
      (f) => f.fileType === 'PHYSICAL_IMAGE',
    );
    if (physicalImageFile) {
      return physicalImageFile.imageKitUrl || (physicalImageFile.storagePath ? `/images/marketplace/${this.getFileNameFromPath(physicalImageFile.storagePath)}` : null);
    }

    return null;
  }

  /**
   * Get all image URLs from content files
   */
  private getAllImageUrls(files: any[]): string[] {
    if (!files || files.length === 0) {
      return [];
    }

    const imageFiles = files.filter(
      (f) =>
        f.fileType === 'THUMBNAIL' ||
        f.fileType === 'PREVIEW_IMAGE' ||
        f.fileType === 'PHYSICAL_IMAGE',
    );

    return imageFiles.map(
      (file) =>
        file.imageKitUrl || (file.storagePath ? `/images/marketplace/${this.getFileNameFromPath(file.storagePath)}` : null),
    ).filter(url => url !== null);
  }

  /**
   * Get video URL from content files
   */
  private getVideoUrl(files: any[]): string | null {
    try {
      console.log('getVideoUrl called with files:', files?.length || 0);
      
      if (!files || files.length === 0) {
        console.log('No files provided to getVideoUrl');
        return null;
      }

      // Log all file types
      files.forEach((file, index) => {
        console.log(`File ${index}:`, { fileType: file.fileType, storagePath: file.storagePath });
      });

      const videoFile = files.find((f) => f.fileType === 'VIDEO_FILE');
      
      if (!videoFile) {
        console.log('No VIDEO_FILE found in files');
        return null;
      }
      
      // Use ImageKit URL if available, otherwise construct URL from storagePath
      let videoUrl = videoFile.imageKitUrl;
      
      if (!videoUrl && videoFile.storagePath) {
        // Extract filename from storage path and construct URL
        const filename = this.getFileNameFromPath(videoFile.storagePath);
        videoUrl = `/images/marketplace/${filename}`;
      }
      
      if (!videoUrl) {
        console.log('Video file found but no URL available');
        return null;
      }

      console.log('Generated video URL:', videoUrl);
      return videoUrl;
    } catch (error) {
      console.error('Error getting video URL:', error);
      return null;
    }
  }

  /**
   * Extract filename from storage path
   */
  private getFileNameFromPath(storagePath: string): string {
    return (
      storagePath.split('\\').pop() ||
      storagePath.split('/').pop() ||
      storagePath
    );
  }
}
