import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AssignmentCategory, AssignmentType } from '@prisma/client';

export class CreateAssignmentDto {
  @IsString()
  classId: string;

  @IsString()
  subjectId: string;

  @IsOptional()
  @IsString()
  termId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsEnum(AssignmentType)
  type?: AssignmentType;

  @IsOptional()
  @IsEnum(AssignmentCategory)
  category?: AssignmentCategory;

  @IsOptional()
  @IsBoolean()
  allowLateSubmission?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  latePenalty?: number;

  @IsOptional()
  @IsBoolean()
  allowResubmission?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxResubmissions?: number;

  @IsOptional()
  @IsBoolean()
  isGroupAssignment?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(2)
  groupSize?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningObjectives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}



