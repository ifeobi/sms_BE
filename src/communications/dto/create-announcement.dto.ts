import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnnouncementType {
  GENERAL = 'GENERAL',
  ACADEMIC = 'ACADEMIC',
  FINANCIAL = 'FINANCIAL',
  EMERGENCY = 'EMERGENCY',
  EVENT = 'EVENT',
}

export enum AnnouncementAudience {
  ALL_PARENTS = 'ALL_PARENTS',
  ALL_STUDENTS = 'ALL_STUDENTS',
  ALL_TEACHERS = 'ALL_TEACHERS',
  SPECIFIC_CLASS = 'SPECIFIC_CLASS',
  SPECIFIC_STUDENTS = 'SPECIFIC_STUDENTS',
  SCHOOL_WIDE = 'SCHOOL_WIDE',
}

export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Announcement title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Announcement content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ 
    description: 'Announcement type', 
    enum: AnnouncementType,
    default: AnnouncementType.GENERAL 
  })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType = AnnouncementType.GENERAL;

  @ApiPropertyOptional({ 
    description: 'Message priority', 
    enum: MessagePriority,
    default: MessagePriority.NORMAL 
  })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority = MessagePriority.NORMAL;

  @ApiPropertyOptional({ 
    description: 'Target audience', 
    enum: AnnouncementAudience,
    default: AnnouncementAudience.ALL_PARENTS 
  })
  @IsOptional()
  @IsEnum(AnnouncementAudience)
  targetAudience?: AnnouncementAudience = AnnouncementAudience.ALL_PARENTS;

  @ApiPropertyOptional({ description: 'Target class IDs for specific class announcements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetClassIds?: string[];

  @ApiPropertyOptional({ description: 'Target student IDs for specific student announcements' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetStudentIds?: string[];

  @ApiPropertyOptional({ description: 'Schedule announcement for later' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Announcement expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'File attachments' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}
