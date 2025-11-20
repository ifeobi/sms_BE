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
exports.StreamingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const imagekit_service_1 = require("../imagekit/imagekit.service");
let StreamingService = class StreamingService {
    prisma;
    imageKitService;
    constructor(prisma, imageKitService) {
        this.prisma = prisma;
        this.imageKitService = imageKitService;
    }
    async getStreamingUrl(purchaseId, studentId, quality = 'medium') {
        const purchase = await this.prisma.digitalPurchase.findFirst({
            where: {
                id: purchaseId,
                studentId,
                status: 'COMPLETED',
            },
            include: {
                content: {
                    include: {
                        files: {
                            where: {
                                fileType: {
                                    in: [
                                        'DIGITAL_FILE',
                                        'VIDEO_FILE',
                                        'AUDIO_FILE',
                                        'WORKSHEET_FILE',
                                        'ASSIGNMENT_FILE',
                                        'PAST_QUESTIONS_FILE',
                                        'NOTES_FILE',
                                        'INTERACTIVE_FILE',
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException('Purchase not found or not completed');
        }
        const digitalFile = purchase.content.files[0];
        if (!digitalFile) {
            throw new common_1.NotFoundException('No digital file found for this content');
        }
        const streamingUrl = await this.generateStreamingUrl(digitalFile, quality);
        await this.prisma.digitalPurchase.update({
            where: { id: purchaseId },
            data: {
                streamCount: { increment: 1 },
                lastStreamedAt: new Date(),
            },
        });
        await this.prisma.content.update({
            where: { id: purchase.contentId },
            data: {
                streamCount: { increment: 1 },
            },
        });
        return {
            url: streamingUrl,
            fileType: digitalFile.mimeType,
            originalName: digitalFile.originalName,
            size: Number(digitalFile.sizeBytes),
            quality,
            streamCount: purchase.streamCount + 1,
        };
    }
    async generateStreamingUrl(file, quality) {
        const mimeType = file.mimeType || '';
        const imageKitUrl = file.imageKitUrl || file.storagePath;
        if (!imageKitUrl) {
            throw new common_1.BadRequestException('No file URL available for streaming');
        }
        if (mimeType.startsWith('video/')) {
            return this.imageKitService.getAdaptiveVideoUrl(file.imageKitFileId, quality);
        }
        if (mimeType === 'application/pdf') {
            return this.generatePdfViewerUrl(imageKitUrl, quality);
        }
        if (mimeType === 'application/epub+zip') {
            return this.generateEpubViewerUrl(imageKitUrl, quality);
        }
        if (mimeType === 'text/html') {
            return imageKitUrl;
        }
        return imageKitUrl;
    }
    generatePdfViewerUrl(baseUrl, quality) {
        const qualitySettings = {
            low: '?q=60&w=800',
            medium: '?q=80&w=1200',
            high: '?q=90&w=1600',
        };
        return `${baseUrl}${qualitySettings[quality]}`;
    }
    generateEpubViewerUrl(baseUrl, quality) {
        const qualitySettings = {
            low: '?q=60&w=800',
            medium: '?q=80&w=1200',
            high: '?q=90&w=1600',
        };
        return `${baseUrl}${qualitySettings[quality]}`;
    }
    async getStreamingAnalytics(contentId) {
        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
            include: {
                digitalPurchases: {
                    select: {
                        streamCount: true,
                        lastStreamedAt: true,
                        student: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!content) {
            throw new common_1.NotFoundException('Content not found');
        }
        const totalStreams = content.digitalPurchases.reduce((sum, purchase) => sum + purchase.streamCount, 0);
        const uniqueStreamers = content.digitalPurchases.filter((purchase) => purchase.streamCount > 0).length;
        return {
            contentId,
            title: content.title,
            totalStreams,
            uniqueStreamers,
            contentStreamCount: content.streamCount,
            recentStreams: content.digitalPurchases
                .filter((p) => p.lastStreamedAt)
                .sort((a, b) => new Date(b.lastStreamedAt).getTime() -
                new Date(a.lastStreamedAt).getTime())
                .slice(0, 10),
        };
    }
};
exports.StreamingService = StreamingService;
exports.StreamingService = StreamingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        imagekit_service_1.ImageKitService])
], StreamingService);
//# sourceMappingURL=streaming.service.js.map