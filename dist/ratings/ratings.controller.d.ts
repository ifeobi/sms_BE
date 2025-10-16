import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/create-rating.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class RatingsController {
    private readonly ratingsService;
    private readonly prisma;
    constructor(ratingsService: RatingsService, prisma: PrismaService);
    private getUserId;
    createRating(req: any, createRatingDto: CreateRatingDto): Promise<any>;
    updateRating(req: any, ratingId: string, updateRatingDto: UpdateRatingDto): Promise<any>;
    getRatingsForMarketplaceItem(marketplaceItemId: string, page: number, limit: number): Promise<{
        ratings: ({
            user: {
                firstName: string;
                lastName: string;
                profilePicture: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            rating: number;
            isVerified: boolean;
            marketplaceItemId: string;
            review: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getRatingStatistics(marketplaceItemId: string): Promise<{
        averageRating: number;
        totalRatings: number;
        distribution: {
            stars: number;
            count: number;
        }[];
    }>;
    getMyRating(req: any, marketplaceItemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        isVerified: boolean;
        marketplaceItemId: string;
        review: string | null;
    } | null>;
    deleteRating(req: any, ratingId: string): Promise<{
        message: string;
    }>;
    getMyRatings(req: any, page: number, limit: number): Promise<{
        ratings: ({
            marketplaceItem: {
                title: string;
                id: string;
                currency: string;
                price: number;
                thumbnailUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            rating: number;
            isVerified: boolean;
            marketplaceItemId: string;
            review: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
