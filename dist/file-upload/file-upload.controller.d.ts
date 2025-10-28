import { FileUploadService } from './file-upload.service';
import { FileType } from '@prisma/client';
import { ImageKitService } from '../imagekit/imagekit.service';
import { VideoUploadRequestDto, VideoUploadResponseDto, VideoTransformDto, VideoThumbnailDto } from '../imagekit/dto/video-upload.dto';
export declare class FileUploadController {
    private readonly fileUploadService;
    private readonly imageKitService;
    constructor(fileUploadService: FileUploadService, imageKitService: ImageKitService);
    uploadSingleFile(file: Express.Multer.File, contentId: string, fileType: FileType): Promise<any>;
    uploadMultipleFiles(files: Express.Multer.File[], contentId: string, fileType: FileType): Promise<any[]>;
    deleteFile(fileId: string, req: any): Promise<{
        message: string;
    }>;
    requestVideoUploadUrl(videoUploadDto: VideoUploadRequestDto, req: any): Promise<VideoUploadResponseDto>;
    handleVideoWebhook(webhookData: any, req: any): Promise<{
        message: string;
    }>;
    getVideoUrl(fileId: string, transformDto: VideoTransformDto): Promise<{
        url: string;
    }>;
    getVideoThumbnail(fileId: string, thumbnailDto: VideoThumbnailDto): Promise<{
        url: string;
    }>;
    getVideoThumbnails(fileId: string, count?: number): Promise<{
        thumbnails: string[];
    }>;
    getVideoStream(fileId: string, quality?: 'low' | 'medium' | 'high'): Promise<{
        url: string;
    }>;
    deleteVideo(fileId: string, req: any): Promise<{
        message: string;
    }>;
}
