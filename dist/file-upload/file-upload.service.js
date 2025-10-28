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
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const imagekit_service_1 = require("../imagekit/imagekit.service");
let FileUploadService = class FileUploadService {
    prisma;
    imageKitService;
    constructor(prisma, imageKitService) {
        this.prisma = prisma;
        this.imageKitService = imageKitService;
    }
    async uploadFile(file, contentId, fileType) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        await this.deleteExistingFilesByType(contentId, fileType);
        const imageKitResult = await this.uploadToImageKit(file, contentId, fileType);
        const fileRecord = await this.prisma.contentFile.create({
            data: {
                contentId,
                fileType,
                originalName: file.originalname,
                storagePath: imageKitResult.url,
                mimeType: file.mimetype,
                sizeBytes: BigInt(file.size),
                imageKitFileId: imageKitResult.fileId,
                imageKitUrl: imageKitResult.url,
            },
        });
        return {
            id: fileRecord.id,
            originalName: fileRecord.originalName,
            url: imageKitResult.url,
            mimeType: fileRecord.mimeType,
            size: Number(fileRecord.sizeBytes),
            fileType: fileRecord.fileType,
            imageKitFileId: imageKitResult.fileId,
        };
    }
    async uploadToImageKit(file, contentId, fileType) {
        try {
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
            const filePath = `content/${contentId}/${fileType.toLowerCase()}/${timestamp}-${randomId}${fileExtension}`;
            const uploadResult = await this.imageKitService.uploadFile({
                file: file.buffer,
                fileName: file.originalname,
                folder: `content/${contentId}/${fileType.toLowerCase()}`,
                useUniqueFileName: true,
                tags: [fileType.toLowerCase(), contentId],
                customMetadata: {
                    contentId,
                    fileType,
                    originalName: file.originalname,
                },
            });
            return {
                fileId: uploadResult.fileId,
                url: uploadResult.url,
            };
        }
        catch (error) {
            console.error('ImageKit upload failed:', error);
            throw new common_1.BadRequestException(`Failed to upload file to ImageKit: ${error.message}`);
        }
    }
    async uploadMultipleFiles(files, contentId, fileType) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadPromises = files.map((file) => this.uploadFile(file, contentId, fileType));
        return Promise.all(uploadPromises);
    }
    async deleteExistingFilesByType(contentId, fileType) {
        const existingFiles = await this.prisma.contentFile.findMany({
            where: {
                contentId,
                fileType,
            },
        });
        for (const file of existingFiles) {
            await this.prisma.contentFile.delete({
                where: { id: file.id },
            });
        }
        if (existingFiles.length > 0) {
            console.log(`Deleted ${existingFiles.length} existing ${fileType} file(s) for content ${contentId}`);
        }
    }
    async deleteFile(fileId, creatorId) {
        const file = await this.prisma.contentFile.findUnique({
            where: { id: fileId },
            include: {
                content: true,
            },
        });
        if (!file) {
            throw new common_1.BadRequestException('File not found');
        }
        if (file.content.creatorId !== creatorId) {
            throw new common_1.BadRequestException('You can only delete files from your own content');
        }
        if (file.imageKitFileId) {
            try {
                await this.imageKitService.deleteFile(file.imageKitFileId);
                console.log(`Deleted file ${file.imageKitFileId} from ImageKit`);
            }
            catch (error) {
                console.error('Failed to delete file from ImageKit:', error);
            }
        }
        await this.prisma.contentFile.delete({
            where: { id: fileId },
        });
    }
    async saveVideoToDatabase(videoData) {
        try {
            const videoFile = await this.prisma.contentFile.upsert({
                where: {
                    id: videoData.fileId,
                },
                update: {
                    storagePath: videoData.url,
                    mimeType: 'video/mp4',
                    sizeBytes: BigInt(videoData.metadata?.size || 0),
                    imageKitFileId: videoData.fileId,
                    imageKitUrl: videoData.url,
                },
                create: {
                    id: videoData.fileId,
                    contentId: videoData.metadata?.contentId || null,
                    fileType: 'VIDEO',
                    originalName: videoData.metadata?.filename || 'video.mp4',
                    storagePath: videoData.url,
                    mimeType: videoData.metadata?.mimeType || 'video/mp4',
                    sizeBytes: BigInt(videoData.metadata?.size || 0),
                    imageKitFileId: videoData.fileId,
                    imageKitUrl: videoData.url,
                },
            });
            return videoFile;
        }
        catch (error) {
            console.error('Error saving video to database:', error);
            throw new common_1.BadRequestException('Failed to save video details');
        }
    }
    async deleteVideoFromDatabase(fileId) {
        try {
            await this.prisma.contentFile.deleteMany({
                where: {
                    imageKitFileId: fileId,
                },
            });
        }
        catch (error) {
            console.error('Error deleting video from database:', error);
            throw new common_1.BadRequestException('Failed to delete video from database');
        }
    }
    async getVideoByImageKitId(fileId) {
        try {
            const video = await this.prisma.contentFile.findFirst({
                where: {
                    imageKitFileId: fileId,
                },
                include: {
                    content: {
                        include: {
                            creator: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            firstName: true,
                                            lastName: true,
                                            profilePicture: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            return video;
        }
        catch (error) {
            console.error('Error getting video details:', error);
            throw new common_1.BadRequestException('Failed to get video details');
        }
    }
    async getCreatorVideos(creatorId) {
        try {
            const videos = await this.prisma.contentFile.findMany({
                where: {
                    fileType: 'VIDEO',
                    content: {
                        creatorId: creatorId,
                    },
                },
                include: {
                    content: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            digitalPrice: true,
                            videoPrice: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: {
                    uploadedAt: 'desc',
                },
            });
            return videos;
        }
        catch (error) {
            console.error('Error getting creator videos:', error);
            throw new common_1.BadRequestException('Failed to get creator videos');
        }
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        imagekit_service_1.ImageKitService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map