import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

class AttendanceRecordInput {
  @IsString()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateAttendanceDto {
  @IsString()
  classId: string;

  @IsString()
  termId: string;

  @IsString()
  @IsOptional()
  subjectId?: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordInput)
  records: AttendanceRecordInput[];
}

