"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MarketplaceService = class MarketplaceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async publishToMarketplace(contentId, creatorId) {
        console.log('Publishing to marketplace:', { contentId, creatorId });
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
            throw new common_1.NotFoundException('Content not found or you do not have permission to publish it');
        }
        console.log('Content found:', {
            id: content.id,
            title: content.title,
            status: content.status,
        });
        if (content.status !== 'PUBLISHED') {
            console.log(`Content status is ${content.status}, waiting and retrying...`);
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
                throw new common_1.NotFoundException(`Content must be published first. Current status: ${retryContent?.status || 'UNKNOWN'}`);
            }
            console.log('Content status verified as PUBLISHED after retry');
        }
        const existingMarketplaceItem = await this.prisma.marketplaceItem.findFirst({
            where: {
                contentId: contentId,
            },
        });
        if (existingMarketplaceItem) {
            console.log('Content already in marketplace:', existingMarketplaceItem.id);
            throw new Error('This content is already published to the marketplace');
        }
        const marketplaceCategory = this.mapContentCategoryToMarketplaceCategory(content.contentCategory?.name || 'textbook');
        console.log('Marketplace category:', marketplaceCategory);
        const price = this.determinePrice(content);
        console.log('Determined price:', price);
        const thumbnailUrl = await this.getBestThumbnailUrl(content.files);
        console.log('Thumbnail URL:', thumbnailUrl);
        const marketplaceItemData = {
            contentId: contentId,
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
            commissionRate: 0.1,
            totalRevenue: 0,
        };
        console.log('Creating marketplace item with data:', marketplaceItemData);
        const marketplaceItem = await this.prisma.marketplaceItem.create({
            data: marketplaceItemData,
        });
        await this.prisma.content.update({
            where: { id: contentId },
            data: {
                marketplacePublishedAt: new Date(),
            },
        });
        console.log('Marketplace item created successfully:', marketplaceItem.id);
        return marketplaceItem;
    }
    async unpublishFromMarketplace(contentId, creatorId) {
        const content = await this.prisma.content.findFirst({
            where: {
                id: contentId,
                creatorId: creatorId,
            },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found or you do not have permission to unpublish it');
        }
        const marketplaceItem = await this.prisma.marketplaceItem.findFirst({
            where: {
                contentId: contentId,
            },
        });
        if (marketplaceItem) {
            await this.prisma.marketplaceItem.delete({
                where: {
                    id: marketplaceItem.id,
                },
            });
            await this.prisma.content.update({
                where: { id: contentId },
                data: {
                    marketplaceUnpublishedAt: new Date(),
                },
            });
        }
        return { message: 'Content removed from marketplace successfully' };
    }
    async getMarketplaceItemById(id) {
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
                        files: true,
                    },
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Marketplace item not found');
        }
        const images = this.getAllImageUrls(item.content?.files || []);
        const videoUrl = this.getVideoUrl(item.content?.files || []);
        console.log('=== MARKETPLACE ITEM BY ID DEBUG ===');
        console.log('Item ID:', item.id);
        console.log('Item category:', item.category);
        console.log('Content files count:', item.content?.files?.length || 0);
        console.log('Video URL extracted:', videoUrl);
        console.log('=====================================');
        return {
            ...item,
            images,
            videoUrl,
        };
    }
    async getMarketplaceItems(params) {
        const { skip = 0, take = 10, category, search } = params || {};
        const where = {
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
                    content: true,
                },
                orderBy: {
                    dateCreated: 'desc',
                },
            }),
            this.prisma.marketplaceItem.count({ where }),
        ]);
        console.log('Found marketplace items:', items.length, 'Total:', total);
        const processedItems = items.map(item => {
            return {
                ...item,
                videoUrl: null,
            };
        });
        return {
            items: processedItems,
            total,
            page: Math.floor(skip / take) + 1,
            totalPages: Math.ceil(total / take),
        };
    }
    mapContentCategoryToMarketplaceCategory(contentCategory) {
        const mapping = {
            textbook: client_1.MarketplaceCategory.TEXTBOOK,
            ebook: client_1.MarketplaceCategory.TEXTBOOK,
            video_course: client_1.MarketplaceCategory.VIDEO_COURSE,
            audio_book: client_1.MarketplaceCategory.AUDIO_BOOK,
            worksheet: client_1.MarketplaceCategory.WORKSHEET,
            assignment: client_1.MarketplaceCategory.ASSIGNMENT,
            past_questions: client_1.MarketplaceCategory.PAST_QUESTIONS,
            notes: client_1.MarketplaceCategory.NOTES,
            interactive: client_1.MarketplaceCategory.INTERACTIVE,
            assessment: client_1.MarketplaceCategory.ASSESSMENT,
            tutorial: client_1.MarketplaceCategory.TUTORIAL,
        };
        return mapping[contentCategory] || client_1.MarketplaceCategory.TEXTBOOK;
    }
    determinePrice(content) {
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
        return 0;
    }
    extractTags(content) {
        const tags = [];
        if (content.contentCategory?.name) {
            tags.push(content.contentCategory.name);
        }
        if (content.subjectCategory?.name) {
            tags.push(content.subjectCategory.name);
        }
        if (content.contentType) {
            tags.push(content.contentType.toLowerCase());
        }
        if (content.tags && Array.isArray(content.tags)) {
            tags.push(...content.tags);
        }
        if (content.contentCategory?.name === 'textbook' &&
            content.textbookAuthor) {
            tags.push(`author:${content.textbookAuthor}`);
        }
        if (content.contentCategory?.name === 'video_course' && content.videoTags) {
            tags.push(...content.videoTags.split(',').map((tag) => tag.trim()));
        }
        if (content.contentCategory?.name === 'worksheet' &&
            content.worksheetTags) {
            tags.push(...content.worksheetTags.split(',').map((tag) => tag.trim()));
        }
        if (content.contentCategory?.name === 'assignment' &&
            content.assignmentTags) {
            tags.push(...content.assignmentTags.split(',').map((tag) => tag.trim()));
        }
        if (content.contentCategory?.name === 'past_questions' &&
            content.pastQuestionsTags) {
            tags.push(...content.pastQuestionsTags
                .split(',')
                .map((tag) => tag.trim()));
        }
        if (content.contentCategory?.name === 'audio_book' &&
            content.audiobookTags) {
            tags.push(...content.audiobookTags.split(',').map((tag) => tag.trim()));
        }
        if (content.contentCategory?.name === 'interactive' &&
            content.interactiveTags) {
            tags.push(...content.interactiveTags.split(',').map((tag) => tag.trim()));
        }
        if (content.contentCategory?.name === 'notes' && content.notesTags) {
            tags.push(...content.notesTags.split(',').map((tag) => tag.trim()));
        }
        return [...new Set(tags.filter((tag) => tag && tag.trim().length > 0))];
    }
    async getBestThumbnailUrl(files) {
        if (!files || files.length === 0) {
            return null;
        }
        const thumbnailFile = files.find((f) => f.fileType === 'THUMBNAIL');
        if (thumbnailFile) {
            return thumbnailFile.imageKitUrl || (thumbnailFile.storagePath ? `/images/marketplace/${this.getFileNameFromPath(thumbnailFile.storagePath)}` : null);
        }
        const previewFile = files.find((f) => f.fileType === 'PREVIEW_IMAGE');
        if (previewFile) {
            return previewFile.imageKitUrl || (previewFile.storagePath ? `/images/marketplace/${this.getFileNameFromPath(previewFile.storagePath)}` : null);
        }
        const physicalImageFile = files.find((f) => f.fileType === 'PHYSICAL_IMAGE');
        if (physicalImageFile) {
            return physicalImageFile.imageKitUrl || (physicalImageFile.storagePath ? `/images/marketplace/${this.getFileNameFromPath(physicalImageFile.storagePath)}` : null);
        }
        return null;
    }
    getAllImageUrls(files) {
        if (!files || files.length === 0) {
            return [];
        }
        const imageFiles = files.filter((f) => f.fileType === 'THUMBNAIL' ||
            f.fileType === 'PREVIEW_IMAGE' ||
            f.fileType === 'PHYSICAL_IMAGE');
        return imageFiles.map((file) => file.imageKitUrl || (file.storagePath ? `/images/marketplace/${this.getFileNameFromPath(file.storagePath)}` : null)).filter(url => url !== null);
    }
    getVideoUrl(files) {
        try {
            console.log('getVideoUrl called with files:', files?.length || 0);
            if (!files || files.length === 0) {
                console.log('No files provided to getVideoUrl');
                return null;
            }
            files.forEach((file, index) => {
                console.log(`File ${index}:`, { fileType: file.fileType, storagePath: file.storagePath });
            });
            const videoFile = files.find((f) => f.fileType === 'VIDEO_FILE');
            if (!videoFile) {
                console.log('No VIDEO_FILE found in files');
                return null;
            }
            let videoUrl = videoFile.imageKitUrl;
            if (!videoUrl && videoFile.storagePath) {
                const filename = this.getFileNameFromPath(videoFile.storagePath);
                videoUrl = `/images/marketplace/${filename}`;
            }
            if (!videoUrl) {
                console.log('Video file found but no URL available');
                return null;
            }
            console.log('Generated video URL:', videoUrl);
            return videoUrl;
        }
        catch (error) {
            console.error('Error getting video URL:', error);
            return null;
        }
    }
    getFileNameFromPath(storagePath) {
        return (storagePath.split('\\').pop() ||
            storagePath.split('/').pop() ||
            storagePath);
    }
};
exports.MarketplaceService = MarketplaceService;
exports.MarketplaceService = MarketplaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketplaceService);
//# sourceMappingURL=marketplace.service.js.map