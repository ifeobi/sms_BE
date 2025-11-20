import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
export declare class RatingsService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrUpdateRating(userId: string, createRatingDto: CreateRatingDto): Promise<any>;
    getRatingsForMarketplaceItem(marketplaceItemId: string, page?: number, limit?: number): Promise<{
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
    getStudentRating(userId: string, marketplaceItemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        isVerified: boolean;
        marketplaceItemId: string;
        review: string | null;
    } | null>;
    deleteRating(userId: string, ratingId: string): Promise<{
        message: string;
    }>;
    getRatingStatistics(marketplaceItemId: string): Promise<{
        averageRating: number;
        totalRatings: number;
        distribution: {
            stars: number;
            count: number;
        }[];
    }>;
    private updateMarketplaceItemRatings;
    markRatingAsVerified(userId: string, marketplaceItemId: string): Promise<void>;
}
