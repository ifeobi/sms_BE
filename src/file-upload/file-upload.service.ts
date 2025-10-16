import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileType } from '@prisma/client';

@Injectable()
export class FileUploadService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(
    file: Express.Multer.File,
    contentId: string,
    fileType: FileType,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Step 1: Delete existing files of the same type for this content
    await this.deleteExistingFilesByType(contentId, fileType);

    // Step 2: Create new file record in database
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
      url: `/images/marketplace/${file.filename}`, // Static file serving URL
      mimeType: fileRecord.mimeType,
      size: Number(fileRecord.sizeBytes), // Convert BigInt to number for JSON serialization
      fileType: fileRecord.fileType,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    contentId: string,
    fileType: FileType,
  ): Promise<any[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) =>
      this.uploadFile(file, contentId, fileType),
    );

    return Promise.all(uploadPromises);
  }

  async deleteExistingFilesByType(
    contentId: string,
    fileType: FileType,
  ): Promise<void> {
    // Find all existing files of the same type for this content
    const existingFiles = await this.prisma.contentFile.findMany({
      where: {
        contentId,
        fileType,
      },
    });

    // Delete each existing file record
    for (const file of existingFiles) {
      await this.prisma.contentFile.delete({
        where: { id: file.id },
      });

      // In production, you would also delete the actual file from storage here
      // Example: fs.unlinkSync(file.storagePath);
    }

    if (existingFiles.length > 0) {
      console.log(
        `Deleted ${existingFiles.length} existing ${fileType} file(s) for content ${contentId}`,
      );
    }
  }

  async deleteFile(fileId: string, creatorId: string): Promise<void> {
    // Check if file belongs to content owned by creator
    const file = await this.prisma.contentFile.findUnique({
      where: { id: fileId },
      include: {
        content: true,
      },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (file.content.creatorId !== creatorId) {
      throw new BadRequestException(
        'You can only delete files from your own content',
      );
    }

    // Delete file record from database
    await this.prisma.contentFile.delete({
      where: { id: fileId },
    });

    // In production, you would also delete the actual file from storage here
  }
}
