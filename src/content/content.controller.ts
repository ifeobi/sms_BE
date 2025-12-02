import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentStatus } from '@prisma/client';
import {
  SubscriptionGuard,
  CheckLimit,
} from '../creator/guards/subscription.guard';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {
    console.log('✅ ContentController initialized - routes should be registered');
    console.log('Routes: POST /content, GET /content, GET /content/my-content, GET /content/:id, etc.');
  }

  @Post()
  @UseGuards(SubscriptionGuard)
  @CheckLimit('product')
  async create(@Body() createContentDto: CreateContentDto, @Request() req) {
    console.log('Content Controller - User from JWT:', req.user);

    let creatorId = req.user.creatorId;

    // If creatorId is not in JWT, look it up from the user ID
    if (!creatorId) {
      console.log(
        'Content Controller - No creatorId in JWT, looking up from userId:',
        req.user.id,
      );
      const creator = await this.contentService.findCreatorByUserId(
        req.user.id,
      );
      if (creator) {
        creatorId = creator.id;
        console.log('Content Controller - Found creatorId:', creatorId);
      } else {
        throw new Error('Creator account not found for this user');
      }
    }

    console.log('Content Controller - CreatorId being used:', creatorId);
    return this.contentService.create(createContentDto, creatorId);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: string,
    @Query('contentCategoryId') contentCategoryId?: string,
    @Query('subjectCategoryId') subjectCategoryId?: string,
  ) {
    const where: any = {};

    // Convert string status to ContentStatus enum
    if (status) {
      const upperStatus = status.toUpperCase();
      if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(upperStatus)) {
        where.status = upperStatus as ContentStatus;
      }
    }

    if (contentCategoryId) where.contentCategoryId = contentCategoryId;
    if (subjectCategoryId) where.subjectCategoryId = subjectCategoryId;

    return this.contentService.findAll({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('my-content')
  async findMyContent(
    @Request() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: string,
  ) {
    console.log('=== MY-CONTENT ENDPOINT HIT ===');
    console.log('Request user:', req.user);
    console.log('Query params:', { skip, take, status });
    
    let creatorId = req.user.creatorId;

    // If creatorId is not in JWT, look it up from the user ID
    if (!creatorId) {
      const creator = await this.contentService.findCreatorByUserId(
        req.user.id,
      );
      if (creator) {
        creatorId = creator.id;
      } else {
        throw new Error('Creator account not found for this user');
      }
    }

    // Convert string status to ContentStatus enum
    let contentStatus: ContentStatus | undefined;
    if (status) {
      const upperStatus = status.toUpperCase();
      if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(upperStatus)) {
        contentStatus = upperStatus as ContentStatus;
      }
    }

    return this.contentService.findByCreator(creatorId, {
      skip,
      take,
      status: contentStatus,
    });
  }

  @Get('categories')
  getContentCategories() {
    return this.contentService.getContentCategories();
  }

  @Get('subject-categories')
  getSubjectCategories() {
    return this.contentService.getSubjectCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @Request() req,
  ) {
    console.log('Update Controller - Content ID:', id);
    console.log('Update Controller - Update data:', updateContentDto);
    console.log('Update Controller - User from JWT:', req.user);

    // Debug specific fields
    console.log('=== CONTROLLER FIELD DEBUG ===');
    console.log('Textbook Author in DTO:', updateContentDto.textbookAuthor);
    console.log(
      'Textbook Publisher in DTO:',
      updateContentDto.textbookPublisher,
    );
    console.log('Textbook Year in DTO:', updateContentDto.textbookYear);
    console.log('==============================');

    let creatorId = req.user.creatorId;

    // If creatorId is not in JWT, look it up from the user ID
    if (!creatorId) {
      const creator = await this.contentService.findCreatorByUserId(
        req.user.id,
      );
      if (creator) {
        creatorId = creator.id;
      } else {
        throw new Error('Creator account not found for this user');
      }
    }

    console.log('Update Controller - Creator ID:', creatorId);
    const result = await this.contentService.update(
      id,
      updateContentDto,
      creatorId,
    );
    console.log('Update Controller - Update result:', result);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    console.log('Delete Controller - User from JWT:', req.user);
    console.log('Delete Controller - Content ID:', id);

    let creatorId = req.user.creatorId;

    // If creatorId is not in JWT, look it up from the user ID
    if (!creatorId) {
      console.log(
        'Delete Controller - No creatorId in JWT, looking up from userId:',
        req.user.id,
      );
      const creator = await this.contentService.findCreatorByUserId(
        req.user.id,
      );
      if (creator) {
        creatorId = creator.id;
        console.log('Delete Controller - Found creatorId:', creatorId);
      } else {
        throw new Error('Creator account not found for this user');
      }
    }

    console.log('Delete Controller - CreatorId being used:', creatorId);
    return this.contentService.remove(id, creatorId);
  }

  @Post('files')
  uploadFile(@Body() uploadFileDto: UploadFileDto) {
    return this.contentService.uploadFile(uploadFileDto);
  }

  @Get(':id/files')
  getContentFiles(@Param('id') contentId: string) {
    return this.contentService.getContentFiles(contentId);
  }

  @Delete('files/:fileId')
  deleteFile(@Param('fileId') fileId: string, @Request() req) {
    const creatorId = req.user.creatorId || req.user.id;
    return this.contentService.deleteFile(fileId, creatorId);
  }

  @Post(':id/view')
  incrementViewCount(@Param('id') contentId: string) {
    return this.contentService.incrementViewCount(contentId);
  }

  @Post(':id/download')
  incrementDownloadCount(@Param('id') contentId: string) {
    return this.contentService.incrementDownloadCount(contentId);
  }

  @Post(':id/sale')
  incrementSalesCount(@Param('id') contentId: string) {
    return this.contentService.incrementSalesCount(contentId);
  }
}
