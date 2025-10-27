import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or update a rating for a marketplace item
   */
  async createOrUpdateRating(
    userId: string,
    createRatingDto: CreateRatingDto,
  ) {
    const { rating, review, marketplaceItemId } = createRatingDto;

    // Check if marketplace item exists
    const marketplaceItem = await this.prisma.marketplaceItem.findUnique({
      where: { id: marketplaceItemId },
    });

    if (!marketplaceItem) {
      throw new NotFoundException('Marketplace item not found');
    }

    // Check if student has already rated this item
    const existingRating = await this.prisma.productRating.findUnique({
      where: {
        userId_marketplaceItemId: {
          userId,
          marketplaceItemId,
        },
      },
    });

    let productRating;
    if (existingRating) {
      // Update existing rating
      productRating = await this.prisma.productRating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          review,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new rating
      productRating = await this.prisma.productRating.create({
        data: {
          rating,
          review,
          userId,
          marketplaceItemId,
          isVerified: false, // Will be updated when they purchase
        },
      });
    }

    // Update marketplace item rating statistics
    await this.updateMarketplaceItemRatings(marketplaceItemId);

    return productRating;
  }

  /**
   * Get ratings for a marketplace item
   */
  async getRatingsForMarketplaceItem(
    marketplaceItemId: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      this.prisma.productRating.findMany({
        where: { marketplaceItemId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.productRating.count({
        where: { marketplaceItemId },
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

  /**
   * Get a student's rating for a specific marketplace item
   */
  async getStudentRating(userId: string, marketplaceItemId: string) {
    return this.prisma.productRating.findUnique({
      where: {
        userId_marketplaceItemId: {
          userId,
          marketplaceItemId,
        },
      },
    });
  }

  /**
   * Delete a rating
   */
  async deleteRating(userId: string, ratingId: string) {
    // Check if rating exists and belongs to student
    const rating = await this.prisma.productRating.findUnique({
      where: { id: ratingId },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.prisma.productRating.delete({
      where: { id: ratingId },
    });

    // Update marketplace item rating statistics
    await this.updateMarketplaceItemRatings(rating.marketplaceItemId);

    return { message: 'Rating deleted successfully' };
  }

  /**
   * Get rating statistics for a marketplace item
   */
  async getRatingStatistics(marketplaceItemId: string) {
    const stats = await this.prisma.productRating.aggregate({
      where: { marketplaceItemId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Get rating distribution (1-5 stars)
    const distribution = await Promise.all(
      [1, 2, 3, 4, 5].map(async (star) => {
        const count = await this.prisma.productRating.count({
          where: {
            marketplaceItemId,
            rating: star,
          },
        });
        return { stars: star, count };
      }),
    );

    return {
      averageRating: stats._avg.rating || 0,
      totalRatings: stats._count.rating || 0,
      distribution,
    };
  }

  /**
   * Update marketplace item rating statistics
   */
  private async updateMarketplaceItemRatings(marketplaceItemId: string) {
    const stats = await this.prisma.productRating.aggregate({
      where: { marketplaceItemId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.marketplaceItem.update({
      where: { id: marketplaceItemId },
      data: {
        rating: stats._avg.rating || 0,
        totalRatings: stats._count.rating || 0,
      },
    });
  }

  /**
   * Mark rating as verified when student purchases the item
   */
  async markRatingAsVerified(userId: string, marketplaceItemId: string) {
    const rating = await this.prisma.productRating.findUnique({
      where: {
        userId_marketplaceItemId: {
          userId,
          marketplaceItemId,
        },
      },
    });

    if (rating) {
      await this.prisma.productRating.update({
        where: { id: rating.id },
        data: { isVerified: true },
      });
    }
  }
}
