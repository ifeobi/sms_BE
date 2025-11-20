import { ConfigService } from '@nestjs/config';
export declare class ImageKitService {
    private configService;
    private imagekit;
    constructor(configService: ConfigService);
    generateUploadUrl(filename: string, fileSize: number, creatorId: string, contentId?: string): Promise<{
        uploadUrl: string;
        fileId: string;
        signature: string;
        expire: number;
        token: string;
        filePath: string;
    }>;
    getOptimizedVideoUrl(fileId: string, transformations?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: string;
    }): string;
    getVideoThumbnailUrl(fileId: string, timeInSeconds?: number): string;
    deleteVideo(fileId: string): Promise<boolean>;
    getVideoDetails(fileId: string): Promise<any>;
    generateVideoThumbnails(fileId: string, count?: number): string[];
    getAdaptiveVideoUrl(fileId: string, quality?: 'low' | 'medium' | 'high'): string;
    uploadFile(uploadData: {
        file: Buffer;
        fileName: string;
        folder?: string;
        useUniqueFileName?: boolean;
        tags?: string[];
        customMetadata?: any;
    }): Promise<{
        fileId: string;
        url: string;
        name: string;
    }>;
    deleteFile(fileId: string): Promise<boolean>;
}
