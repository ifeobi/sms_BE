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
    determineContentType(contentCategoryName) {
        const digitalCategories = [
            'video_course',
            'ebook',
            'audio_book',
            'interactive',
        ];
        const normalizedCategory = contentCategoryName.toLowerCase().trim();
        if (digitalCategories.includes(normalizedCategory)) {
            return 'DIGITAL';
        }
        return 'PHYSICAL';
    }
    async findCreatorByUserId(userId) {
        return this.prisma.creator.findUnique({
            where: { userId },
            include: { user: true },
        });
    }
    async create(createContentDto, creatorId) {
        console.log('Content Service - Received creatorId:', creatorId);
        console.log('Content Service - CreateContentDto:', createContentDto);
        const creator = await this.prisma.creator.findUnique({
            where: { id: creatorId },
            include: { user: true },
        });
        console.log('Content Service - Found creator:', creator);
        if (!creator) {
            const allCreators = await this.prisma.creator.findMany({
                include: { user: true },
            });
            console.log('Content Service - All creators in database:', allCreators);
            throw new Error(`Creator with ID ${creatorId} not found. Please ensure you have a valid creator account.`);
        }
        console.log(`Creating content for creator: ${creator.user.email} (${creatorId})`);
        const contentCategory = await this.prisma.contentCategory.findUnique({
            where: { id: createContentDto.contentCategoryId },
        });
        if (!contentCategory) {
            throw new Error(`Content category with ID ${createContentDto.contentCategoryId} not found`);
        }
        const contentType = this.determineContentType(contentCategory.name);
        console.log(`Auto-determined contentType: ${contentType} for category: ${contentCategory.name}`);
        return this.prisma.content.create({
            data: {
                ...createContentDto,
                contentType,
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
        const content = await this.prisma.content.findMany({
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
                files: {
                    orderBy: {
                        uploadedAt: 'desc',
                    },
                },
            },
        });
        const contentWithThumbnails = await Promise.all(content.map(async (item) => {
            console.log('=== PROCESSING CONTENT FOR THUMBNAIL (findAll) ===');
            console.log('Content ID:', item.id);
            console.log('Content Title:', item.title);
            console.log('Total files attached:', item.files.length);
            const thumbnailUrl = await this.getBestThumbnailUrl(item.id, item.files);
            const videoFile = item.files.find((f) => f.fileType === 'VIDEO_FILE');
            const audioFile = item.files.find((f) => f.fileType === 'AUDIO_FILE');
            console.log('Selected thumbnail URL:', thumbnailUrl);
            console.log('Video file:', videoFile
                ? `${videoFile.originalName} (${videoFile.storagePath})`
                : 'None');
            console.log('Audio file:', audioFile
                ? `${audioFile.originalName} (${audioFile.storagePath})`
                : 'None');
            console.log('===================================================');
            const getFileNameFromPath = (storagePath) => {
                return (storagePath.split('\\').pop() ||
                    storagePath.split('/').pop() ||
                    storagePath);
            };
            return {
                ...item,
                thumbnail_url: thumbnailUrl,
                video_url: videoFile
                    ? `/images/marketplace/${getFileNameFromPath(videoFile.storagePath)}`
                    : null,
                audio_url: audioFile
                    ? `/images/marketplace/${getFileNameFromPath(audioFile.storagePath)}`
                    : null,
                video_filename: videoFile ? videoFile.originalName : null,
                audio_filename: audioFile ? audioFile.originalName : null,
                files: undefined,
            };
        }));
        console.log('=== FIND ALL CONTENT RESPONSE SUMMARY ===');
        console.log('Total content items processed:', contentWithThumbnails.length);
        console.log('Content items with thumbnails:', contentWithThumbnails.filter((c) => c.thumbnail_url !== null).length);
        console.log('Content items without thumbnails:', contentWithThumbnails.filter((c) => c.thumbnail_url === null).length);
        console.log('==========================================');
        return contentWithThumbnails;
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
                    orderBy: {
                        uploadedAt: 'desc',
                    },
                },
            },
        });
        const contentWithThumbnails = await Promise.all(content.map(async (item) => {
            console.log('=== PROCESSING CONTENT FOR THUMBNAIL ===');
            console.log('Content ID:', item.id);
            console.log('Content Title:', item.title);
            console.log('Content Category:', item.contentCategoryId);
            console.log('Total files attached:', item.files.length);
            const thumbnailUrl = await this.getBestThumbnailUrl(item.id, item.files);
            const videoFile = item.files.find((f) => f.fileType === 'VIDEO_FILE');
            const audioFile = item.files.find((f) => f.fileType === 'AUDIO_FILE');
            console.log('Selected thumbnail URL:', thumbnailUrl);
            console.log('Video file:', videoFile
                ? `${videoFile.originalName} (${videoFile.storagePath})`
                : 'None');
            console.log('Audio file:', audioFile
                ? `${audioFile.originalName} (${audioFile.storagePath})`
                : 'None');
            console.log('========================================');
            const getFileNameFromPath = (storagePath) => {
                return (storagePath.split('\\').pop() ||
                    storagePath.split('/').pop() ||
                    storagePath);
            };
            return {
                ...item,
                thumbnail_url: thumbnailUrl,
                video_url: videoFile
                    ? `/images/marketplace/${getFileNameFromPath(videoFile.storagePath)}`
                    : null,
                audio_url: audioFile
                    ? `/images/marketplace/${getFileNameFromPath(audioFile.storagePath)}`
                    : null,
                video_filename: videoFile ? videoFile.originalName : null,
                audio_filename: audioFile ? audioFile.originalName : null,
                files: undefined,
            };
        }));
        console.log('=== BACKEND CONTENT RESPONSE SUMMARY ===');
        console.log('Total content items processed:', contentWithThumbnails.length);
        console.log('Content items with thumbnails:', contentWithThumbnails.filter((c) => c.thumbnail_url !== null).length);
        console.log('Content items without thumbnails:', contentWithThumbnails.filter((c) => c.thumbnail_url === null).length);
        console.log('=========================================');
        return contentWithThumbnails;
    }
    async getBestThumbnailUrl(contentId, files) {
        let allFiles = files;
        if (!allFiles) {
            const contentFiles = await this.prisma.contentFile.findMany({
                where: { contentId },
                orderBy: { uploadedAt: 'desc' },
            });
            allFiles = contentFiles;
        }
        console.log('--- Finding Best Thumbnail ---');
        console.log('Content ID:', contentId);
        console.log('Total files to check:', allFiles?.length || 0);
        if (!allFiles || allFiles.length === 0) {
            console.log('No files found for this content');
            return null;
        }
        console.log('Available files:');
        allFiles.forEach((file, index) => {
            console.log(`  File ${index + 1}:`, {
                id: file.id,
                type: file.fileType,
                name: file.originalName,
                mimeType: file.mimeType,
                uploadedAt: file.uploadedAt,
            });
        });
        const thumbnailFile = allFiles.find((file) => file.fileType === 'THUMBNAIL');
        if (thumbnailFile) {
            console.log('✓ Found THUMBNAIL file:', thumbnailFile.originalName);
            return this.constructFileUrl(thumbnailFile.storagePath);
        }
        console.log('✗ No THUMBNAIL file found');
        const previewImageFile = allFiles.find((file) => file.fileType === 'PREVIEW_IMAGE');
        if (previewImageFile) {
            console.log('✓ Found PREVIEW_IMAGE file:', previewImageFile.originalName);
            return this.constructFileUrl(previewImageFile.storagePath);
        }
        console.log('✗ No PREVIEW_IMAGE file found');
        const physicalImageFile = allFiles.find((file) => file.fileType === 'PHYSICAL_IMAGE');
        if (physicalImageFile) {
            console.log('✓ Found PHYSICAL_IMAGE file:', physicalImageFile.originalName);
            return this.constructFileUrl(physicalImageFile.storagePath);
        }
        console.log('✗ No PHYSICAL_IMAGE file found');
        const anyImageFile = allFiles.find((file) => file.mimeType && file.mimeType.startsWith('image/'));
        if (anyImageFile) {
            console.log('✓ Found generic image file:', anyImageFile.originalName, '(type:', anyImageFile.fileType + ')');
            return this.constructFileUrl(anyImageFile.storagePath);
        }
        console.log('✗ No image files found at all');
        console.log('⚠ No suitable thumbnail found for content:', contentId);
        return null;
    }
    constructFileUrl(storagePath) {
        if (!storagePath) {
            console.warn('Empty storage path provided to constructFileUrl');
            return null;
        }
        const filename = storagePath.split(/[/\\]/).pop();
        if (!filename) {
            console.warn('Could not extract filename from storage path:', storagePath);
            return null;
        }
        const fileUrl = `/images/marketplace/${filename}`;
        console.log('Constructed file URL:', fileUrl, 'from storage path:', storagePath);
        return fileUrl;
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
        console.log('Textbook Author field in data:', updateContentDto.textbookAuthor);
        console.log('Textbook Publisher field in data:', updateContentDto.textbookPublisher);
        console.log('Textbook Year field in data:', updateContentDto.textbookYear);
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