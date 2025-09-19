import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum AssignmentType {
  TEST = 'test',
  QUIZ = 'quiz',
  HOMEWORK = 'homework',
  PROJECT = 'project',
  EXAM = 'exam',
  CLASSWORK = 'classwork',
}

export enum AssignmentCategory {
  FORMATIVE = 'formative',
  SUMMATIVE = 'summative',
  DIAGNOSTIC = 'diagnostic',
}

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Assignment title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Assignment description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Subject ID' })
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'Class ID' })
  @IsString()
  classId: string;

  @ApiProperty({ description: 'Academic term ID' })
  @IsString()
  termId: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Maximum score' })
  @IsNumber()
  @Min(0)
  maxScore: number;

  @ApiProperty({ description: 'Weight percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType })
  @IsString()
  type: AssignmentType;

  @ApiProperty({ description: 'Assignment category', enum: AssignmentCategory })
  @IsString()
  category: AssignmentCategory;

  @ApiProperty({ description: 'Allow late submission', default: true })
  @IsBoolean()
  @IsOptional()
  allowLateSubmission?: boolean;

  @ApiProperty({ description: 'Late penalty percentage', default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  latePenalty?: number;

  @ApiProperty({ description: 'Allow resubmission', default: false })
  @IsBoolean()
  @IsOptional()
  allowResubmission?: boolean;

  @ApiProperty({ description: 'Maximum resubmissions', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxResubmissions?: number;

  @ApiProperty({ description: 'Is group assignment', default: false })
  @IsBoolean()
  @IsOptional()
  isGroupAssignment?: boolean;

  @ApiProperty({ description: 'Group size', default: 2 })
  @IsNumber()
  @Min(2)
  @IsOptional()
  groupSize?: number;

  @ApiProperty({ description: 'Assignment instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ description: 'Learning objectives', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];

  @ApiProperty({ description: 'Tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateAssignmentDto {
  @ApiProperty({ description: 'Assignment title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Assignment description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Due date', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ description: 'Maximum score', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number;

  @ApiProperty({ description: 'Weight percentage', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType, required: false })
  @IsString()
  @IsOptional()
  type?: AssignmentType;

  @ApiProperty({ description: 'Assignment category', enum: AssignmentCategory, required: false })
  @IsString()
  @IsOptional()
  category?: AssignmentCategory;

  @ApiProperty({ description: 'Allow late submission', required: false })
  @IsBoolean()
  @IsOptional()
  allowLateSubmission?: boolean;

  @ApiProperty({ description: 'Late penalty percentage', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  latePenalty?: number;

  @ApiProperty({ description: 'Allow resubmission', required: false })
  @IsBoolean()
  @IsOptional()
  allowResubmission?: boolean;

  @ApiProperty({ description: 'Maximum resubmissions', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxResubmissions?: number;

  @ApiProperty({ description: 'Is group assignment', required: false })
  @IsBoolean()
  @IsOptional()
  isGroupAssignment?: boolean;

  @ApiProperty({ description: 'Group size', required: false })
  @IsNumber()
  @Min(2)
  @IsOptional()
  groupSize?: number;

  @ApiProperty({ description: 'Assignment instructions', required: false })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ description: 'Learning objectives', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];

  @ApiProperty({ description: 'Tags', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class GradeEntryDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Score obtained' })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ description: 'Teacher comments', required: false })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({ description: 'Teacher feedback', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ description: 'Is late submission', default: false })
  @IsBoolean()
  @IsOptional()
  isLate?: boolean;
}

export class CreateGradeDto {
  @ApiProperty({ description: 'Assignment ID' })
  @IsString()
  assignmentId: string;

  @ApiProperty({ description: 'Subject ID' })
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'Class ID' })
  @IsString()
  classId: string;

  @ApiProperty({ description: 'Academic term ID' })
  @IsString()
  termId: string;

  @ApiProperty({ description: 'Grade entries', type: [GradeEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeEntryDto)
  grades: GradeEntryDto[];
}

export class UpdateGradeDto {
  @ApiProperty({ description: 'Score obtained', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  score?: number;

  @ApiProperty({ description: 'Teacher comments', required: false })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({ description: 'Teacher feedback', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ description: 'Is late submission', required: false })
  @IsBoolean()
  @IsOptional()
  isLate?: boolean;
}

export class AssignmentResponseDto {
  @ApiProperty({ description: 'Assignment ID' })
  id: string;

  @ApiProperty({ description: 'Assignment title' })
  title: string;

  @ApiProperty({ description: 'Assignment description' })
  description: string;

  @ApiProperty({ description: 'Subject information' })
  subject: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Class information' })
  class: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Academic term information' })
  term: {
    id: string;
    name: string;
    academicYear: string;
  };

  @ApiProperty({ description: 'Due date' })
  dueDate: Date;

  @ApiProperty({ description: 'Maximum score' })
  maxScore: number;

  @ApiProperty({ description: 'Weight percentage' })
  weight: number;

  @ApiProperty({ description: 'Assignment type' })
  type: string;

  @ApiProperty({ description: 'Assignment category' })
  category: string;

  @ApiProperty({ description: 'Allow late submission' })
  allowLateSubmission: boolean;

  @ApiProperty({ description: 'Late penalty percentage' })
  latePenalty: number;

  @ApiProperty({ description: 'Allow resubmission' })
  allowResubmission: boolean;

  @ApiProperty({ description: 'Maximum resubmissions' })
  maxResubmissions: number;

  @ApiProperty({ description: 'Is group assignment' })
  isGroupAssignment: boolean;

  @ApiProperty({ description: 'Group size' })
  groupSize?: number;

  @ApiProperty({ description: 'Assignment instructions' })
  instructions?: string;

  @ApiProperty({ description: 'Learning objectives' })
  learningObjectives?: string[];

  @ApiProperty({ description: 'Tags' })
  tags?: string[];

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

export class GradeResponseDto {
  @ApiProperty({ description: 'Academic record ID' })
  id: string;

  @ApiProperty({ description: 'Student information' })
  student: {
    id: string;
    studentNumber: string;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Subject information' })
  subject: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Class information' })
  class: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Assignment information' })
  assignment?: {
    id: string;
    title: string;
  };

  @ApiProperty({ description: 'Academic term information' })
  term: {
    id: string;
    name: string;
    academicYear: string;
  };

  @ApiProperty({ description: 'Score obtained' })
  score: number;

  @ApiProperty({ description: 'Maximum score' })
  maxScore: number;

  @ApiProperty({ description: 'Grade letter' })
  grade: string;

  @ApiProperty({ description: 'Percentage score' })
  percentage: number;

  @ApiProperty({ description: 'GPA points' })
  gpa: number;

  @ApiProperty({ description: 'Teacher comments' })
  comments?: string | null;

  @ApiProperty({ description: 'Teacher feedback' })
  feedback?: string | null;

  @ApiProperty({ description: 'Is late submission' })
  isLate: boolean;

  @ApiProperty({ description: 'Late penalty applied' })
  latePenaltyApplied: number;

  @ApiProperty({ description: 'Resubmission count' })
  resubmissionCount: number;

  @ApiProperty({ description: 'Graded date' })
  gradedAt: Date;

  @ApiProperty({ description: 'Recorded date' })
  recordedAt: Date;

  @ApiProperty({ description: 'Is published' })
  isPublished: boolean;

  @ApiProperty({ description: 'Published date' })
  publishedAt?: Date | null;
}

export class TeacherGradesOverviewDto {
  @ApiProperty({ description: 'Total assignments' })
  totalAssignments: number;

  @ApiProperty({ description: 'Total grades recorded' })
  totalGrades: number;

  @ApiProperty({ description: 'Pending grades' })
  pendingGrades: number;

  @ApiProperty({ description: 'Average class performance' })
  averagePerformance: number;

  @ApiProperty({ description: 'Classes with assignments' })
  classes: Array<{
    id: string;
    name: string;
    subjectCount: number;
    assignmentCount: number;
    averageScore: number;
  }>;

  @ApiProperty({ description: 'Recent assignments' })
  recentAssignments: Array<{
    id: string;
    title: string;
    class: string;
    subject: string;
    dueDate: Date;
    gradedCount: number;
    totalStudents: number;
  }>;
}
