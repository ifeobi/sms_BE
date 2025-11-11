import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class BulkStudentDataDto {
  @IsString()
  fullName: string;

  @IsEnum(Gender)
  sex: Gender;

  @IsDateString()
  dateOfBirth: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  parentFullName: string;

  @IsEmail()
  parentEmail: string;

  @IsString()
  parentPhone: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];
}

export class BulkStudentImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkStudentDataDto)
  students: BulkStudentDataDto[];

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  classId?: string;
}

export class BulkImportResponseDto {
  id: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  status: string;
  errorLog?: any;
  createdAt: Date;
}

export class BulkImportProgressDto {
  id: string;
  status: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  progress: number; // Percentage
  estimatedTimeRemaining?: number; // in seconds
}

export class VerificationCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

export class ParentLinkResponseDto {
  success: boolean;
  message: string;
  parentId?: string;
  studentId?: string;
}
