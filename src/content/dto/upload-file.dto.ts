import { IsString, IsEnum, IsOptional } from 'class-validator';
import { FileType } from '@prisma/client';

export class UploadFileDto {
  @IsString()
  contentId: string;

  @IsEnum(FileType)
  fileType: FileType;

  @IsString()
  originalName: string;

  @IsString()
  storagePath: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  sizeBytes?: bigint;
}
