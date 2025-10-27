import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentService } from '../content/content.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly contentService: ContentService,
  ) {}

  /**
   * Get all marketplace items (public endpoint)
   */
  @Get()
  async getMarketplaceItems(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.marketplaceService.getMarketplaceItems({
      skip,
      take,
      category,
      search,
    });
  }

  /**
   * Get a single marketplace item by ID (public endpoint)
   */
  @Get(':id')
  async getMarketplaceItem(@Param('id') id: string) {
    return this.marketplaceService.getMarketplaceItemById(id);
  }

  /**
   * Publish content to marketplace (authenticated endpoint)
   */
  @Post('publish/:contentId')
  @UseGuards(JwtAuthGuard)
  async publishToMarketplace(
    @Param('contentId') contentId: string,
    @Request() req,
  ) {
    let creatorId = req.user.creatorId;

    // If creatorId is not in JWT, look it up from the user ID
    if (!creatorId) {
      const creator = await this.contentService.findCreatorByUserId(
        req.user.id,
      );
      if (creator) {
        creatorId = creator.id;
      }
    }

    if (!creatorId) {
      throw new BadRequestException('Creator account not found for this user');
    }

    return this.marketplaceService.publishToMarketplace(contentId, creatorId);
  }

  /**
   * Remove content from marketplace (authenticated endpoint)
   */
  @Delete('unpublish/:contentId')
  @UseGuards(JwtAuthGuard)
  async unpublishFromMarketplace(
    @Param('contentId') contentId: string,
    @Request() req,
  ) {
    let creatorId = req.user.creatorId;

    // If creatorId is not in JWT, look it up from the user ID
    if (!creatorId) {
      const creator = await this.contentService.findCreatorByUserId(
        req.user.id,
      );
      if (creator) {
        creatorId = creator.id;
      }
    }

    if (!creatorId) {
      throw new BadRequestException('Creator account not found for this user');
    }

    return this.marketplaceService.unpublishFromMarketplace(
      contentId,
      creatorId,
    );
  }
}
