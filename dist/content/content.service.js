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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContentService = class ContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findCreatorByUserId(userId) {
        return this.prisma.creator.findUnique({
            where: { userId },
            include: { user: true }
        });
    }
    async create(createContentDto, creatorId) {
        console.log('Content Service - Received creatorId:', creatorId);
        console.log('Content Service - CreateContentDto:', createContentDto);
        const creator = await this.prisma.creator.findUnique({
            where: { id: creatorId },
            include: { user: true }
        });
        console.log('Content Service - Found creator:', creator);
        if (!creator) {
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
    async findAll(params) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Content with ID ${id} not found`);
        }
        return content;
    }
    async findByCreator(creatorId, params) {
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
                files: {
                    take: 1,
                    orderBy: {
                        uploadedAt: 'desc'
                    }
                },
            },
        });
        const contentWithThumbnails = content.map(item => {
            let thumbnailUrl = null;
            if (item.files.length > 0) {
                thumbnailUrl = `/images/marketplace/${item.files[0].storagePath.split('\\').pop()}`;
            }
            else {
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
    async update(id, updateContentDto, creatorId) {
        console.log('Update Service - Content ID:', id);
        console.log('Update Service - Update DTO:', updateContentDto);
        console.log('Update Service - Creator ID:', creatorId);
        const existingContent = await this.findOne(id);
        console.log('Update Service - Existing content:', existingContent);
        if (existingContent.creatorId !== creatorId) {
            console.log('Update Service - Creator ID mismatch, throwing ForbiddenException');
            throw new common_1.ForbiddenException('You can only update your own content');
        }
        console.log('Update Service - Proceeding with update');
        console.log('Update Service - Data being sent to Prisma:', JSON.stringify(updateContentDto, null, 2));
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
            },
        });
        console.log('Update Service - Update result:', result);
        console.log('Update Service - Result author:', result.author);
        console.log('Update Service - Result publisher:', result.publisher);
        console.log('Update Service - Result year:', result.year);
        return result;
    }
    async remove(id, creatorId) {
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
            throw new common_1.NotFoundException(`Content with ID ${id} not found`);
        }
        if (existingContent.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('You can only delete your own content');
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
    async uploadFile(uploadFileDto) {
        return this.prisma.contentFile.create({
            data: uploadFileDto,
        });
    }
    async getContentFiles(contentId) {
        return this.prisma.contentFile.findMany({
            where: { contentId },
        });
    }
    async deleteFile(fileId, creatorId) {
        const file = await this.prisma.contentFile.findUnique({
            where: { id: fileId },
            include: {
                content: true,
            },
        });
        if (!file) {
            throw new common_1.NotFoundException(`File with ID ${fileId} not found`);
        }
        if (file.content.creatorId !== creatorId) {
            throw new common_1.ForbiddenException('You can only delete files from your own content');
        }
        return this.prisma.contentFile.delete({
            where: { id: fileId },
        });
    }
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
    async createContentCategory(name, description) {
        return this.prisma.contentCategory.create({
            data: { name, description },
        });
    }
    async createSubjectCategory(name, description) {
        return this.prisma.subjectCategory.create({
            data: { name, description },
        });
    }
    async incrementViewCount(contentId) {
        await this.prisma.content.update({
            where: { id: contentId },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });
    }
    async incrementDownloadCount(contentId) {
        await this.prisma.content.update({
            where: { id: contentId },
            data: {
                downloadCount: {
                    increment: 1,
                },
            },
        });
    }
    async incrementSalesCount(contentId) {
        await this.prisma.content.update({
            where: { id: contentId },
            data: {
                salesCount: {
                    increment: 1,
                },
            },
        });
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map