import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { Content, ContentStatus, Prisma } from '@prisma/client';
export declare class ContentService {
    private prisma;
    constructor(prisma: PrismaService);
    private determineContentType;
    findCreatorByUserId(userId: string): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            email: string;
            password: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            profilePicture: string | null;
            phone: string | null;
            createdBy: string | null;
            lastLoginAt: Date | null;
            fullName: string | null;
            bio: string | null;
            country: string | null;
            website: string | null;
            isEmailVerified: boolean;
        };
    } & {
        id: string;
        userId: string;
        verified: boolean;
        rating: number;
        totalProducts: number;
        totalSales: number;
        totalRevenue: number;
        joinDate: Date;
        specialties: string[];
        isActive: boolean;
        categories: string[];
        plan: string;
    }) | null>;
    create(createContentDto: CreateContentDto, creatorId: string): Promise<Content>;
    findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ContentWhereUniqueInput;
        where?: Prisma.ContentWhereInput;
        orderBy?: Prisma.ContentOrderByWithRelationInput;
    }): Promise<Content[]>;
    findOne(id: string): Promise<Content>;
    findByCreator(creatorId: string, params?: {
        skip?: number;
        take?: number;
        status?: ContentStatus;
    }): Promise<Content[]>;
    private getBestThumbnailUrl;
    private constructFileUrl;
    update(id: string, updateContentDto: UpdateContentDto, creatorId: string): Promise<Content>;
    remove(id: string, creatorId: string): Promise<Content>;
    uploadFile(uploadFileDto: UploadFileDto): Promise<any>;
    getContentFiles(contentId: string): Promise<any[]>;
    deleteFile(fileId: string, creatorId: string): Promise<any>;
    getContentCategories(): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getSubjectCategories(): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createContentCategory(name: string, description?: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createSubjectCategory(name: string, description?: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    incrementViewCount(contentId: string): Promise<void>;
    incrementDownloadCount(contentId: string): Promise<void>;
    incrementSalesCount(contentId: string): Promise<void>;
}
