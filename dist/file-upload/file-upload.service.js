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
let FileUploadService = class FileUploadService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadFile(file, contentId, fileType) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const fileRecord = await this.prisma.contentFile.create({
            data: {
                contentId,
                fileType,
                originalName: file.originalname,
                storagePath: file.path,
                mimeType: file.mimetype,
                sizeBytes: BigInt(file.size),
            },
        });
        return {
            id: fileRecord.id,
            originalName: fileRecord.originalName,
            url: `/images/marketplace/${file.filename}`,
            mimeType: fileRecord.mimeType,
            size: Number(fileRecord.sizeBytes),
            fileType: fileRecord.fileType,
        };
    }
    async uploadMultipleFiles(files, contentId, fileType) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadPromises = files.map(file => this.uploadFile(file, contentId, fileType));
        return Promise.all(uploadPromises);
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
        await this.prisma.contentFile.delete({
            where: { id: fileId },
        });
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map