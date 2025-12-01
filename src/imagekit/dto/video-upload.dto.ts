import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoUploadRequestDto {
  @ApiProperty({
    description: 'Original filename of the video',
    example: 'my-educational-video.mp4',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 52428800,
  })
  @IsNumber()
  @Min(1)
  @Max(500 * 1024 * 1024) // 500MB max
  fileSize: number;

  @ApiProperty({
    description: 'Creator ID who is uploading the video',
    example: 'creator_123',
  })
  @IsString()
  creatorId: string;

  @ApiPropertyOptional({
    description: 'Content ID if updating existing content',
    example: 'content_456',
  })
  @IsOptional()
  @IsString()
  contentId?: string;

  @ApiPropertyOptional({
    description: 'Video title for metadata',
    example: 'Advanced Mathematics Tutorial',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Video description',
    example: 'Comprehensive tutorial covering calculus fundamentals',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class VideoUploadResponseDto {
  @ApiProperty({
    description: 'Secure upload URL for direct upload to ImageKit',
    example: 'https://upload.imagekit.io/api/v1/files/upload',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'Unique file ID for tracking',
    example: '1703123456789-abc123def456',
  })
  fileId: string;

  @ApiProperty({
    description: 'Authentication signature',
    example: 'signature_here',
  })
  signature: string;

  @ApiProperty({
    description: 'Token for authentication',
    example: 'token_here',
  })
  token: string;

  @ApiProperty({
    description: 'Expiration timestamp',
    example: 1703123456,
  })
  expire: number;

  @ApiProperty({
    description: 'File path in ImageKit',
    example: 'videos/creator_123/1703123456789-abc123def456-my-video.mp4',
  })
  filePath: string;
}

export class VideoTransformDto {
  @ApiPropertyOptional({
    description: 'Video width in pixels',
    example: 1280,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(3840)
  width?: number;

  @ApiPropertyOptional({
    description: 'Video height in pixels',
    example: 720,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(2160)
  height?: number;

  @ApiPropertyOptional({
    description: 'Video quality (1-100)',
    example: 80,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;

  @ApiPropertyOptional({
    description: 'Output format',
    enum: ['mp4', 'webm', 'avi'],
    example: 'mp4',
  })
  @IsOptional()
  @IsEnum(['mp4', 'webm', 'avi'])
  format?: string;
}

export class VideoThumbnailDto {
  @ApiProperty({
    description: 'Time in seconds for thumbnail',
    example: 5,
  })
  @IsNumber()
  @Min(0)
  timeInSeconds: number;

  @ApiPropertyOptional({
    description: 'Thumbnail width',
    example: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1920)
  width?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail height',
    example: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1080)
  height?: number;
}
