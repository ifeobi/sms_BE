import { ImageKitService } from './imagekit.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ImageKitWebhookController {
    private readonly imageKitService;
    private readonly fileUploadService;
    private readonly prisma;
    private readonly logger;
    constructor(imageKitService: ImageKitService, fileUploadService: FileUploadService, prisma: PrismaService);
    handleVideoUploadWebhook(webhookData: any, headers: any): Promise<{
        message: string;
    }>;
    private handleVideoUploaded;
    private handleVideoProcessingCompleted;
    private handleVideoProcessingFailed;
    private handleVideoDeleted;
    testWebhook(data: any): Promise<{
        message: string;
    }>;
}
