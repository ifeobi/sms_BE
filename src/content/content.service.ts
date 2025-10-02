import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { Content, ContentStatus, Prisma } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async findCreatorByUserId(userId: string) {
    return this.prisma.creator.findUnique({
      where: { userId },
      include: { user: true }
    });
  }

  async create(createContentDto: CreateContentDto, creatorId: string): Promise<Content> {
    console.log('Content Service - Received creatorId:', creatorId);
    console.log('Content Service - CreateContentDto:', createContentDto);
    
    // First, check if the creator exists
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
      include: { user: true }
    });

    console.log('Content Service - Found creator:', creator);

    if (!creator) {
      // Let's also check if there are any creators in the database
      const allCreators = await this.prisma.creator.findMany({
        include: { user: true }
      });
      console.log('Content Service - All creators in database:', allCreators);
      
      throw new Error(`Creator with ID ${creatorId} not found. Please ensure you have a valid creator account.`);
    }

    console.log(`Creating content for creator: ${creator.user.email} (${creatorId})`);

    return this.prisma.content.create({
      data: {
        ...createContentDto,
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

    return this.prisma.content.findMany({
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
        files: true,
      },
    });
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

  async findByCreator(creatorId: string, params?: {
    skip?: number;
    take?: number;
    status?: ContentStatus;
  }): Promise<Content[]> {
    const { skip, take, status } = params || {};

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
        // Include files to get thumbnail URLs - get any files associated with content
        files: {
          take: 1,
          orderBy: {
            uploadedAt: 'desc'
          }
        },
      },
    });

    // Add thumbnail URLs to content and remove files to avoid BigInt serialization
    const contentWithThumbnails = content.map(item => {
      let thumbnailUrl: string | null = null;
      
      if (item.files.length > 0) {
        // Use the first associated file
        thumbnailUrl = `/images/marketplace/${item.files[0].storagePath.split('\\').pop()}`;
      } else {
        // Fallback: try to find any files that might be associated with this content
        // This is a temporary solution until we can properly associate files with content
        console.log(`No files found for content ${item.id}, checking for fallback images...`);
      }
      
      console.log('=== BACKEND THUMBNAIL DEBUG ===');
      console.log('Content ID:', item.id);
      console.log('Content Title:', item.title);
      console.log('Files count:', item.files.length);
      console.log('All files:', item.files);
      console.log('First file:', item.files[0]);
      if (item.files[0]) {
        console.log('First file storagePath:', item.files[0].storagePath);
        console.log('First file originalName:', item.files[0].originalName);
        console.log('First file fileType:', item.files[0].fileType);
      }
      console.log('Generated thumbnail URL:', thumbnailUrl);
      console.log('================================');
      
      return {
        ...item,
        thumbnail_url: thumbnailUrl,
        // Remove files from response to avoid BigInt serialization
        files: undefined
      };
    });

    console.log('=== BACKEND RESPONSE DEBUG ===');
    console.log('Content with thumbnails:', contentWithThumbnails);
    console.log('First item thumbnail_url:', contentWithThumbnails[0]?.thumbnail_url);
    console.log('First item keys:', contentWithThumbnails[0] ? Object.keys(contentWithThumbnails[0]) : 'No items');
    console.log('================================');
    
    return contentWithThumbnails;
  }

  async update(id: string, updateContentDto: UpdateContentDto, creatorId: string): Promise<Content> {
    console.log('Update Service - Content ID:', id);
    console.log('Update Service - Update DTO:', updateContentDto);
    console.log('Update Service - Creator ID:', creatorId);
    
    // Check if content exists and belongs to the creator
    const existingContent = await this.findOne(id);
    console.log('Update Service - Existing content:', existingContent);
    
    if (existingContent.creatorId !== creatorId) {
      console.log('Update Service - Creator ID mismatch, throwing ForbiddenException');
      throw new ForbiddenException('You can only update your own content');
    }

    console.log('Update Service - Proceeding with update');
    console.log('Update Service - Data being sent to Prisma:', JSON.stringify(updateContentDto, null, 2));
    
    // Log the exact Prisma operation
    console.log('=== PRISMA UPDATE OPERATION DEBUG ===');
    console.log('Where clause:', { id });
    console.log('Data being updated:', updateContentDto);
    console.log('Author field in data:', updateContentDto.author);
    console.log('Publisher field in data:', updateContentDto.publisher);
    console.log('Year field in data:', updateContentDto.year);
    console.log('Physical delivery method in data:', updateContentDto.physicalDeliveryMethod);
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
    console.log('Update Service - Result author:', result.author);
    console.log('Update Service - Result publisher:', result.publisher);
    console.log('Update Service - Result year:', result.year);
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
      throw new ForbiddenException('You can only delete files from your own content');
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
