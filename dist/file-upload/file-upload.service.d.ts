import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';
export declare class FileUploadService {
    private prisma;
    constructor(prisma: PrismaService);
    uploadFile(file: Express.Multer.File, contentId: string, fileType: FileType): Promise<any>;
    uploadMultipleFiles(files: Express.Multer.File[], contentId: string, fileType: FileType): Promise<any[]>;
    deleteFile(fileId: string, creatorId: string): Promise<void>;
}
