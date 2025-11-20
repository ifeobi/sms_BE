import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { CreatorHistoryService } from './creator-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('Creator History')
@ApiBearerAuth()
@Controller('creator/history')
@UseGuards(JwtAuthGuard)
export class CreatorHistoryController {
  constructor(
    private readonly historyService: CreatorHistoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get creator content history' })
  @ApiResponse({ status: 200, description: 'Content history retrieved successfully' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of items to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of items to take' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (ISO string)' })
  @ApiQuery({ name: 'contentType', required: false, type: String, description: 'Content type filter' })
  async getHistory(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('contentType') contentType?: string,
  ) {
    const creatorId = req.user.creatorId || req.user.id;
    
    const params = {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      contentType,
    };

    return this.historyService.getCreatorHistory(creatorId, params);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get creator history analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (ISO string)' })
  async getAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const creatorId = req.user.creatorId || req.user.id;
    
    const params = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.historyService.getHistoryAnalytics(creatorId, params);
  }

  @Get(':contentId/performance')
  @ApiOperation({ summary: 'Get content performance details' })
  @ApiResponse({ status: 200, description: 'Performance details retrieved successfully' })
  async getContentPerformance(
    @Request() req,
    @Param('contentId') contentId: string,
  ) {
    const creatorId = req.user.creatorId || req.user.id;
    return this.historyService.getContentPerformance(creatorId, contentId);
  }

  @Delete(':contentId/unpublish')
  @ApiOperation({ summary: 'Unpublish content from marketplace' })
  @ApiResponse({ status: 200, description: 'Content unpublished successfully' })
  async unpublishContent(
    @Request() req,
    @Param('contentId') contentId: string,
  ) {
    const creatorId = req.user.creatorId || req.user.id;
    return this.historyService.unpublishFromMarketplace(creatorId, contentId);
  }
}
