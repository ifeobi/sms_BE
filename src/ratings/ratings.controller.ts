import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(
    private readonly ratingsService: RatingsService,
    private readonly prisma: PrismaService,
  ) {}

  private async getUserId(userId: string): Promise<string> {
    // In a Jiji-like marketplace, any authenticated user can rate/review
    // Just return the userId directly since ratings are tied to users, not students
    return userId;
  }

  @Post()
  async createRating(@Request() req, @Body() createRatingDto: CreateRatingDto) {
    const userId = await this.getUserId(req.user.id);
    return this.ratingsService.createOrUpdateRating(userId, createRatingDto);
  }

  @Put(':id')
  async updateRating(
    @Request() req,
    @Param('id') ratingId: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    const userId = await this.getUserId(req.user.id);

    // Get the existing rating to get marketplaceItemId
    const existingRating = await this.prisma.productRating.findUnique({
      where: { id: ratingId },
    });

    if (!existingRating) {
      throw new Error('Rating not found');
    }

    if (existingRating.userId !== userId) {
      throw new Error('You can only update your own ratings');
    }

    // Create a DTO with the marketplace item ID
    const createRatingDto: CreateRatingDto = {
      rating: updateRatingDto.rating,
      review: updateRatingDto.review,
      marketplaceItemId: existingRating.marketplaceItemId,
    };

    return this.ratingsService.createOrUpdateRating(userId, createRatingDto);
  }

  @Get('marketplace-item/:marketplaceItemId')
  async getRatingsForMarketplaceItem(
    @Param('marketplaceItemId') marketplaceItemId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ratingsService.getRatingsForMarketplaceItem(
      marketplaceItemId,
      page,
      limit,
    );
  }

  @Get('marketplace-item/:marketplaceItemId/statistics')
  async getRatingStatistics(
    @Param('marketplaceItemId') marketplaceItemId: string,
  ) {
    return this.ratingsService.getRatingStatistics(marketplaceItemId);
  }

  @Get('marketplace-item/:marketplaceItemId/my-rating')
  async getMyRating(
    @Request() req,
    @Param('marketplaceItemId') marketplaceItemId: string,
  ) {
    const userId = await this.getUserId(req.user.id);
    return this.ratingsService.getStudentRating(userId, marketplaceItemId);
  }

  @Delete(':id')
  async deleteRating(@Request() req, @Param('id') ratingId: string) {
    const userId = await this.getUserId(req.user.id);
    return this.ratingsService.deleteRating(userId, ratingId);
  }

  @Get('my-ratings')
  async getMyRatings(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = await this.getUserId(req.user.id);
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      this.prisma.productRating.findMany({
        where: { userId: userId },
        include: {
          marketplaceItem: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              price: true,
              currency: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.productRating.count({
        where: { userId: userId },
      }),
    ]);

    return {
      ratings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
