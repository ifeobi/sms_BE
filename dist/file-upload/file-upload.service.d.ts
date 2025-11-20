import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';
import { ImageKitService } from '../imagekit/imagekit.service';
export declare class FileUploadService {
    private prisma;
    private imageKitService;
    constructor(prisma: PrismaService, imageKitService: ImageKitService);
    uploadFile(file: Express.Multer.File, contentId: string, fileType: FileType): Promise<any>;
    private uploadToImageKit;
    uploadMultipleFiles(files: Express.Multer.File[], contentId: string, fileType: FileType): Promise<any[]>;
    deleteExistingFilesByType(contentId: string, fileType: FileType): Promise<void>;
    deleteFile(fileId: string, creatorId: string): Promise<void>;
    saveVideoToDatabase(videoData: {
        fileId: string;
        url: string;
        metadata: any;
        creatorId: string;
    }): Promise<any>;
    deleteVideoFromDatabase(fileId: string): Promise<void>;
    getVideoByImageKitId(fileId: string): Promise<any>;
    getCreatorVideos(creatorId: string): Promise<any[]>;
}
