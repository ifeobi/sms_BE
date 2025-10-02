import { FileUploadService } from './file-upload.service';
import { FileType } from '@prisma/client';
export declare class FileUploadController {
    private readonly fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadSingleFile(file: Express.Multer.File, contentId: string, fileType: FileType): Promise<any>;
    uploadMultipleFiles(files: Express.Multer.File[], contentId: string, fileType: FileType): Promise<any[]>;
    deleteFile(fileId: string, req: any): Promise<{
        message: string;
    }>;
}
