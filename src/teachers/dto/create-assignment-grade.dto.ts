import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAssignmentGradeDto {
  @IsString()
  studentId: string;

  @IsString()
  assignmentId: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  termId?: string;

  @IsNumber()
  @Min(0)
  score: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxScore?: number;

  @IsOptional()
  @IsString()
  grade?: string;
}

