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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_upload_service_1 = require("./file-upload.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
const imagekit_service_1 = require("../imagekit/imagekit.service");
const video_upload_dto_1 = require("../imagekit/dto/video-upload.dto");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
let FileUploadController = class FileUploadController {
    fileUploadService;
    imageKitService;
    constructor(fileUploadService, imageKitService) {
        this.fileUploadService = fileUploadService;
        this.imageKitService = imageKitService;
    }
    async uploadSingleFile(file, contentId, fileType) {
        return this.fileUploadService.uploadFile(file, contentId, fileType);
    }
    async uploadMultipleFiles(files, contentId, fileType) {
        return this.fileUploadService.uploadMultipleFiles(files, contentId, fileType);
    }
    async deleteFile(fileId, req) {
        const creatorId = req.user.creatorId || req.user.id;
        await this.fileUploadService.deleteFile(fileId, creatorId);
        return { message: 'File deleted successfully' };
    }
    async requestVideoUploadUrl(videoUploadDto, req) {
        const creatorId = req.user.creatorId || req.user.id;
        return this.imageKitService.generateUploadUrl(videoUploadDto.filename, videoUploadDto.fileSize, creatorId, videoUploadDto.contentId);
    }
    async handleVideoWebhook(webhookData, req) {
        const { fileId, status, url, metadata } = webhookData;
        if (status === 'completed') {
            await this.fileUploadService.saveVideoToDatabase({
                fileId,
                url,
                metadata,
                creatorId: req.user.creatorId || req.user.id,
            });
        }
        return { message: 'Webhook processed successfully' };
    }
    async getVideoUrl(fileId, transformDto) {
        const optimizedUrl = this.imageKitService.getOptimizedVideoUrl(fileId, transformDto);
        return { url: optimizedUrl };
    }
    async getVideoThumbnail(fileId, thumbnailDto) {
        const thumbnailUrl = this.imageKitService.getVideoThumbnailUrl(fileId, thumbnailDto.timeInSeconds);
        return { url: thumbnailUrl };
    }
    async getVideoThumbnails(fileId, count = 5) {
        const thumbnails = this.imageKitService.generateVideoThumbnails(fileId, count);
        return { thumbnails };
    }
    async getVideoStream(fileId, quality = 'medium') {
        const streamUrl = this.imageKitService.getAdaptiveVideoUrl(fileId, quality);
        return { url: streamUrl };
    }
    async deleteVideo(fileId, req) {
        const creatorId = req.user.creatorId || req.user.id;
        const videoDetails = await this.imageKitService.getVideoDetails(fileId);
        if (!videoDetails || videoDetails.customMetadata?.creatorId !== creatorId) {
            throw new common_2.BadRequestException('Unauthorized to delete this video');
        }
        const deleted = await this.imageKitService.deleteVideo(fileId);
        if (deleted) {
            await this.fileUploadService.deleteVideoFromDatabase(fileId);
        }
        return { message: 'Video deleted successfully' };
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('contentId')),
    __param(2, (0, common_1.Body)('fileType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadSingleFile", null);
__decorate([
    (0, common_1.Post)('multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('contentId')),
    __param(2, (0, common_1.Body)('fileType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Delete)('file/:fileId'),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)('video/request-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get secure upload URL for video upload to ImageKit' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Upload URL generated successfully',
        type: video_upload_dto_1.VideoUploadResponseDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format or size' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [video_upload_dto_1.VideoUploadRequestDto, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "requestVideoUploadUrl", null);
__decorate([
    (0, common_1.Post)('video/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle ImageKit webhook notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "handleVideoWebhook", null);
__decorate([
    (0, common_1.Get)('video/:fileId/url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get optimized video URL' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Video URL generated successfully' }),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, video_upload_dto_1.VideoTransformDto]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getVideoUrl", null);
__decorate([
    (0, common_1.Get)('video/:fileId/thumbnail'),
    (0, swagger_1.ApiOperation)({ summary: 'Get video thumbnail URL' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thumbnail URL generated successfully' }),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, video_upload_dto_1.VideoThumbnailDto]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getVideoThumbnail", null);
__decorate([
    (0, common_1.Get)('video/:fileId/thumbnails'),
    (0, swagger_1.ApiOperation)({ summary: 'Get multiple video thumbnails for preview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thumbnail URLs generated successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'count', required: false, description: 'Number of thumbnails (default: 5)' }),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getVideoThumbnails", null);
__decorate([
    (0, common_1.Get)('video/:fileId/stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Get adaptive video streaming URL' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Streaming URL generated successfully' }),
    (0, swagger_1.ApiQuery)({
        name: 'quality',
        required: false,
        enum: ['low', 'medium', 'high'],
        description: 'Video quality (default: medium)'
    }),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Query)('quality')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getVideoStream", null);
__decorate([
    (0, common_1.Delete)('video/:fileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete video from ImageKit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Video deleted successfully' }),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteVideo", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, swagger_1.ApiTags)('File Upload'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService,
        imagekit_service_1.ImageKitService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map