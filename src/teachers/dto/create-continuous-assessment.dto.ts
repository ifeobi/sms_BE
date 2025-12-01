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

  // Support dynamic CA fields (ca1, ca2, ca3, ..., ca20, etc.)
  // Using index signature to allow any ca* field
  [key: string]: any;

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

