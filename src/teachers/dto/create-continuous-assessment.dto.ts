import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContinuousAssessmentRecordInput {
  @IsString()
  studentId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ca1?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ca2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ca3?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ca4?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  exam?: number;

  @IsOptional()
  @IsString()
  grade?: string;
}

export class CreateContinuousAssessmentDto {
  @IsString()
  classId: string;

  @IsString()
  subjectId: string;

  @IsString()
  termId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContinuousAssessmentRecordInput)
  records: ContinuousAssessmentRecordInput[];
}

