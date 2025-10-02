import { FileType } from '@prisma/client';
export declare class UploadFileDto {
    contentId: string;
    fileType: FileType;
    originalName: string;
    storagePath: string;
    mimeType?: string;
    sizeBytes?: bigint;
}
