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
exports.ImageKitService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ImageKit = require('imagekit');
let ImageKitService = class ImageKitService {
    configService;
    imagekit;
    constructor(configService) {
        this.configService = configService;
        const publicKey = this.configService.get('IMAGEKIT_PUBLIC_KEY');
        const privateKey = this.configService.get('IMAGEKIT_PRIVATE_KEY');
        const urlEndpoint = this.configService.get('IMAGEKIT_URL_ENDPOINT');
        console.log('ImageKit Config Debug:');
        console.log('Public Key:', publicKey ? 'SET' : 'NOT SET');
        console.log('Private Key:', privateKey ? 'SET' : 'NOT SET');
        console.log('URL Endpoint:', urlEndpoint ? 'SET' : 'NOT SET');
        if (publicKey && privateKey && urlEndpoint) {
            this.imagekit = new ImageKit({
                publicKey,
                privateKey,
                urlEndpoint,
            });
            console.log('✅ ImageKit initialized successfully');
        }
        else {
            console.log('⚠️ ImageKit not initialized - missing environment variables');
            this.imagekit = null;
        }
    }
    async generateUploadUrl(filename, fileSize, creatorId, contentId) {
        if (!this.imagekit) {
            throw new common_1.BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
        }
        try {
            const maxSize = 500 * 1024 * 1024;
            if (fileSize > maxSize) {
                throw new common_1.BadRequestException('File size exceeds 500MB limit');
            }
            const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
            const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
            if (!allowedExtensions.includes(fileExtension)) {
                throw new common_1.BadRequestException('Invalid file format. Supported formats: MP4, MOV, AVI, MKV, WebM, M4V');
            }
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const filePath = `videos/${creatorId}/${timestamp}-${randomId}-${filename}`;
            const authenticationParameters = this.imagekit.getAuthenticationParameters();
            return {
                uploadUrl: `${this.configService.get('IMAGEKIT_URL_ENDPOINT')}/api/v1/files/upload`,
                fileId: `${timestamp}-${randomId}`,
                signature: authenticationParameters.signature,
                expire: authenticationParameters.expire,
                token: authenticationParameters.token,
                filePath,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to generate upload URL: ${error.message}`);
        }
    }
    getOptimizedVideoUrl(fileId, transformations) {
        try {
            let url = `${this.configService.get('IMAGEKIT_URL_ENDPOINT')}/${fileId}`;
            if (transformations) {
                const params = new URLSearchParams();
                if (transformations.width)
                    params.append('w', transformations.width.toString());
                if (transformations.height)
                    params.append('h', transformations.height.toString());
                if (transformations.quality)
                    params.append('q', transformations.quality.toString());
                if (transformations.format)
                    params.append('f', transformations.format);
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
            }
            return url;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to generate video URL: ${error.message}`);
        }
    }
    getVideoThumbnailUrl(fileId, timeInSeconds = 1) {
        try {
            return `${this.configService.get('IMAGEKIT_URL_ENDPOINT')}/${fileId}?t=${timeInSeconds}&f=jpg`;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to generate thumbnail URL: ${error.message}`);
        }
    }
    async deleteVideo(fileId) {
        if (!this.imagekit) {
            throw new common_1.BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
        }
        try {
            await this.imagekit.deleteFile(fileId);
            return true;
        }
        catch (error) {
            console.error('Failed to delete video from ImageKit:', error);
            return false;
        }
    }
    async getVideoDetails(fileId) {
        if (!this.imagekit) {
            throw new common_1.BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
        }
        try {
            const details = await this.imagekit.getFileDetails(fileId);
            return details;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to get video details: ${error.message}`);
        }
    }
    generateVideoThumbnails(fileId, count = 5) {
        const thumbnails = [];
        const baseUrl = this.configService.get('IMAGEKIT_URL_ENDPOINT');
        for (let i = 0; i < count; i++) {
            const timeInSeconds = (i + 1) * 2;
            thumbnails.push(`${baseUrl}/${fileId}?t=${timeInSeconds}&f=jpg&w=300&h=200`);
        }
        return thumbnails;
    }
    getAdaptiveVideoUrl(fileId, quality = 'medium') {
        const baseUrl = this.configService.get('IMAGEKIT_URL_ENDPOINT');
        const qualitySettings = {
            low: '?q=60&w=640',
            medium: '?q=80&w=1280',
            high: '?q=90&w=1920'
        };
        return `${baseUrl}/${fileId}${qualitySettings[quality]}`;
    }
    async uploadFile(uploadData) {
        if (!this.imagekit) {
            throw new common_1.BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
        }
        try {
            const uploadResult = await this.imagekit.upload({
                file: uploadData.file,
                fileName: uploadData.fileName,
                folder: uploadData.folder || '/',
                useUniqueFileName: uploadData.useUniqueFileName || true,
                tags: uploadData.tags || [],
                customMetadata: uploadData.customMetadata || {},
            });
            return {
                fileId: uploadResult.fileId,
                url: uploadResult.url,
                name: uploadResult.name,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload file to ImageKit: ${error.message}`);
        }
    }
    async deleteFile(fileId) {
        if (!this.imagekit) {
            throw new common_1.BadRequestException('ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT environment variables.');
        }
        try {
            await this.imagekit.deleteFile(fileId);
            return true;
        }
        catch (error) {
            console.error('Failed to delete file from ImageKit:', error);
            return false;
        }
    }
};
exports.ImageKitService = ImageKitService;
exports.ImageKitService = ImageKitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ImageKitService);
//# sourceMappingURL=imagekit.service.js.map