import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  SICK = 'SICK',
}

export class CreateAttendanceRecordDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Class ID' })
  @IsString()
  classId: string;

  @ApiProperty({ description: 'Term ID' })
  @IsString()
  termId: string;

  @ApiProperty({ description: 'Attendance date' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ description: 'Reason for absence/late', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkAttendanceRecordDto {
  @ApiProperty({ description: 'Class ID' })
  @IsString()
  classId: string;

  @ApiProperty({ description: 'Term ID' })
  @IsString()
  termId: string;

  @ApiProperty({ description: 'Attendance date' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Array of student attendance records' })
  @IsArray()
  records: {
    studentId: string;
    status: AttendanceStatus;
    reason?: string;
  }[];
}

export class AttendanceRecordResponseDto {
  @ApiProperty({ description: 'Attendance record ID' })
  id: string;

  @ApiProperty({ description: 'Student ID' })
  studentId: string;

  @ApiProperty({ description: 'Student name' })
  studentName: string;

  @ApiProperty({ description: 'Class ID' })
  classId: string;

  @ApiProperty({ description: 'Class name' })
  className: string;

  @ApiProperty({ description: 'Term ID' })
  termId: string;

  @ApiProperty({ description: 'Attendance date' })
  date: Date;

  @ApiProperty({ description: 'Attendance status' })
  status: string;

  @ApiProperty({ description: 'Reason for absence/late', required: false })
  reason?: string;

  @ApiProperty({ description: 'Recorded at timestamp' })
  recordedAt: Date;

  @ApiProperty({ description: 'Recorded by user ID' })
  recordedBy: string;
}

export class AttendancePatternResponseDto {
  @ApiProperty({ description: 'Student ID' })
  studentId: string;

  @ApiProperty({ description: 'Student name' })
  studentName: string;

  @ApiProperty({ description: 'Total days recorded' })
  totalDays: number;

  @ApiProperty({ description: 'Present days' })
  presentDays: number;

  @ApiProperty({ description: 'Absent days' })
  absentDays: number;

  @ApiProperty({ description: 'Late days' })
  lateDays: number;

  @ApiProperty({ description: 'Excused days' })
  excusedDays: number;

  @ApiProperty({ description: 'Sick days' })
  sickDays: number;

  @ApiProperty({ description: 'Attendance percentage' })
  attendancePercentage: number;

  @ApiProperty({ description: 'Attendance status category' })
  status: string;
}

export class AttendanceAnalyticsResponseDto {
  @ApiProperty({ description: 'Class ID' })
  classId: string;

  @ApiProperty({ description: 'Class name' })
  className: string;

  @ApiProperty({ description: 'Total students' })
  totalStudents: number;

  @ApiProperty({ description: 'Average attendance percentage' })
  averageAttendance: number;

  @ApiProperty({ description: 'Students with excellent attendance (≥90%)' })
  excellentAttendance: number;

  @ApiProperty({ description: 'Students with good attendance (80-89%)' })
  goodAttendance: number;

  @ApiProperty({ description: 'Students with fair attendance (70-79%)' })
  fairAttendance: number;

  @ApiProperty({ description: 'Students with poor attendance (<70%)' })
  poorAttendance: number;

  @ApiProperty({ description: 'Attendance patterns', type: [AttendancePatternResponseDto] })
  patterns: AttendancePatternResponseDto[];
}

export class UpdateAttendanceRecordDto {
  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ description: 'Reason for absence/late', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
