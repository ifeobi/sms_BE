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
var ImageKitWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageKitWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const imagekit_service_1 = require("./imagekit.service");
const file_upload_service_1 = require("../file-upload/file-upload.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ImageKitWebhookController = ImageKitWebhookController_1 = class ImageKitWebhookController {
    imageKitService;
    fileUploadService;
    prisma;
    logger = new common_1.Logger(ImageKitWebhookController_1.name);
    constructor(imageKitService, fileUploadService, prisma) {
        this.imageKitService = imageKitService;
        this.fileUploadService = fileUploadService;
        this.prisma = prisma;
    }
    async handleVideoUploadWebhook(webhookData, headers) {
        try {
            this.logger.log('Received ImageKit video upload webhook');
            this.logger.debug('Webhook data:', JSON.stringify(webhookData, null, 2));
            this.logger.debug('Headers:', JSON.stringify(headers, null, 2));
            const { type, data } = webhookData;
            if (type === 'video.uploaded') {
                await this.handleVideoUploaded(data);
            }
            else if (type === 'video.processing.completed') {
                await this.handleVideoProcessingCompleted(data);
            }
            else if (type === 'video.processing.failed') {
                await this.handleVideoProcessingFailed(data);
            }
            else if (type === 'video.deleted') {
                await this.handleVideoDeleted(data);
            }
            else {
                this.logger.warn(`Unknown webhook type: ${type}`);
            }
            return { message: 'Webhook processed successfully' };
        }
        catch (error) {
            this.logger.error('Error processing ImageKit webhook:', error);
            throw error;
        }
    }
    async handleVideoUploaded(data) {
        this.logger.log('Processing video uploaded event');
        const { fileId, name, url, size, mimeType, customMetadata, } = data;
        try {
            const videoData = {
                fileId,
                url,
                metadata: {
                    filename: name,
                    size,
                    mimeType,
                    creatorId: customMetadata?.creatorId,
                    contentId: customMetadata?.contentId,
                },
                creatorId: customMetadata?.creatorId,
            };
            await this.fileUploadService.saveVideoToDatabase(videoData);
            this.logger.log(`Video ${fileId} saved to database successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to save video ${fileId} to database:`, error);
            throw error;
        }
    }
    async handleVideoProcessingCompleted(data) {
        this.logger.log('Processing video processing completed event');
        const { fileId, url, thumbnailUrl, duration, customMetadata, } = data;
        try {
            await this.prisma.contentFile.updateMany({
                where: {
                    imageKitFileId: fileId,
                },
                data: {
                    imageKitUrl: url,
                    thumbnailUrl: thumbnailUrl,
                    videoDuration: duration,
                    isProcessed: true,
                },
            });
            this.logger.log(`Video ${fileId} processing completed and updated in database`);
        }
        catch (error) {
            this.logger.error(`Failed to update video ${fileId} after processing:`, error);
            throw error;
        }
    }
    async handleVideoProcessingFailed(data) {
        this.logger.log('Processing video processing failed event');
        const { fileId, error: processingError, customMetadata, } = data;
        try {
            await this.prisma.contentFile.updateMany({
                where: {
                    imageKitFileId: fileId,
                },
                data: {
                    isProcessed: false,
                },
            });
            this.logger.error(`Video ${fileId} processing failed:`, processingError);
        }
        catch (error) {
            this.logger.error(`Failed to update video ${fileId} after processing failure:`, error);
            throw error;
        }
    }
    async handleVideoDeleted(data) {
        this.logger.log('Processing video deleted event');
        const { fileId } = data;
        try {
            await this.fileUploadService.deleteVideoFromDatabase(fileId);
            this.logger.log(`Video ${fileId} removed from database`);
        }
        catch (error) {
            this.logger.error(`Failed to remove video ${fileId} from database:`, error);
            throw error;
        }
    }
    async testWebhook(data) {
        this.logger.log('Test webhook received');
        this.logger.debug('Test data:', JSON.stringify(data, null, 2));
        return { message: 'Test webhook received successfully' };
    }
};
exports.ImageKitWebhookController = ImageKitWebhookController;
__decorate([
    (0, common_1.Post)('video-upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle ImageKit video upload webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImageKitWebhookController.prototype, "handleVideoUploadWebhook", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, swagger_1.ApiOperation)({ summary: 'Test webhook endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test webhook received' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ImageKitWebhookController.prototype, "testWebhook", null);
exports.ImageKitWebhookController = ImageKitWebhookController = ImageKitWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('ImageKit Webhooks'),
    (0, common_1.Controller)('webhooks/imagekit'),
    __metadata("design:paramtypes", [imagekit_service_1.ImageKitService,
        file_upload_service_1.FileUploadService,
        prisma_service_1.PrismaService])
], ImageKitWebhookController);
//# sourceMappingURL=imagekit-webhook.controller.js.map