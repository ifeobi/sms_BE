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
exports.VideoThumbnailDto = exports.VideoTransformDto = exports.VideoUploadResponseDto = exports.VideoUploadRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class VideoUploadRequestDto {
    filename;
    fileSize;
    creatorId;
    contentId;
    title;
    description;
}
exports.VideoUploadRequestDto = VideoUploadRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original filename of the video',
        example: 'my-educational-video.mp4',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoUploadRequestDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 52428800,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(500 * 1024 * 1024),
    __metadata("design:type", Number)
], VideoUploadRequestDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creator ID who is uploading the video',
        example: 'creator_123',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoUploadRequestDto.prototype, "creatorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Content ID if updating existing content',
        example: 'content_456',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoUploadRequestDto.prototype, "contentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Video title for metadata',
        example: 'Advanced Mathematics Tutorial',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoUploadRequestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Video description',
        example: 'Comprehensive tutorial covering calculus fundamentals',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoUploadRequestDto.prototype, "description", void 0);
class VideoUploadResponseDto {
    uploadUrl;
    fileId;
    signature;
    token;
    expire;
    filePath;
}
exports.VideoUploadResponseDto = VideoUploadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Secure upload URL for direct upload to ImageKit',
        example: 'https://upload.imagekit.io/api/v1/files/upload',
    }),
    __metadata("design:type", String)
], VideoUploadResponseDto.prototype, "uploadUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique file ID for tracking',
        example: '1703123456789-abc123def456',
    }),
    __metadata("design:type", String)
], VideoUploadResponseDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Authentication signature',
        example: 'signature_here',
    }),
    __metadata("design:type", String)
], VideoUploadResponseDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token for authentication',
        example: 'token_here',
    }),
    __metadata("design:type", String)
], VideoUploadResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Expiration timestamp',
        example: 1703123456,
    }),
    __metadata("design:type", Number)
], VideoUploadResponseDto.prototype, "expire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File path in ImageKit',
        example: 'videos/creator_123/1703123456789-abc123def456-my-video.mp4',
    }),
    __metadata("design:type", String)
], VideoUploadResponseDto.prototype, "filePath", void 0);
class VideoTransformDto {
    width;
    height;
    quality;
    format;
}
exports.VideoTransformDto = VideoTransformDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Video width in pixels',
        example: 1280,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(3840),
    __metadata("design:type", Number)
], VideoTransformDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Video height in pixels',
        example: 720,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(2160),
    __metadata("design:type", Number)
], VideoTransformDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Video quality (1-100)',
        example: 80,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], VideoTransformDto.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Output format',
        enum: ['mp4', 'webm', 'avi'],
        example: 'mp4',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['mp4', 'webm', 'avi']),
    __metadata("design:type", String)
], VideoTransformDto.prototype, "format", void 0);
class VideoThumbnailDto {
    timeInSeconds;
    width;
    height;
}
exports.VideoThumbnailDto = VideoThumbnailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time in seconds for thumbnail',
        example: 5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VideoThumbnailDto.prototype, "timeInSeconds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Thumbnail width',
        example: 300,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(1920),
    __metadata("design:type", Number)
], VideoThumbnailDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Thumbnail height',
        example: 200,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(1080),
    __metadata("design:type", Number)
], VideoThumbnailDto.prototype, "height", void 0);
//# sourceMappingURL=video-upload.dto.js.map