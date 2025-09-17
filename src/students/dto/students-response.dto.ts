import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ description: 'Student ID' })
  id: string;

  @ApiProperty({ description: 'Student number' })
  studentNumber: string;

  @ApiProperty({ description: 'Student name' })
  name: string;

  @ApiProperty({ description: 'Student email' })
  email: string;

  @ApiProperty({ description: 'Student phone' })
  phone?: string;

  @ApiProperty({ description: 'Student avatar URL' })
  avatar?: string;

  @ApiProperty({ description: 'Student status' })
  status: string;

  @ApiProperty({ description: 'Current class' })
  currentClass: string;

  @ApiProperty({ description: 'Current level' })
  currentLevel: string;

  @ApiProperty({ description: 'Academic year' })
  academicYear: string;

  @ApiProperty({ description: 'Enrollment date' })
  enrollmentDate: Date;

  @ApiProperty({ description: 'School information' })
  school: {
    id: string;
    name: string;
    address?: string;
  };
}

export class AcademicRecordDto {
  @ApiProperty({ description: 'Record ID' })
  id: string;

  @ApiProperty({ description: 'Subject name' })
  subject: string;

  @ApiProperty({ description: 'Assignment name' })
  assignment?: string;

  @ApiProperty({ description: 'Score obtained' })
  score: number;

  @ApiProperty({ description: 'Maximum possible score' })
  maxScore: number;

  @ApiProperty({ description: 'Grade letter' })
  grade: string;

  @ApiProperty({ description: 'Percentage score' })
  percentage: number;

  @ApiProperty({ description: 'GPA points' })
  gpa: number;

  @ApiProperty({ description: 'Teacher comments' })
  comments?: string;

  @ApiProperty({ description: 'Teacher feedback' })
  feedback?: string;

  @ApiProperty({ description: 'Graded date' })
  gradedAt: Date;

  @ApiProperty({ description: 'Term information' })
  term: {
    id: string;
    name: string;
    academicYear: string;
  };

  @ApiProperty({ description: 'Teacher information' })
  teacher: {
    id: string;
    name: string;
  };
}

export class AttendanceRecordDto {
  @ApiProperty({ description: 'Attendance record ID' })
  id: string;

  @ApiProperty({ description: 'Attendance date' })
  date: Date;

  @ApiProperty({ description: 'Attendance status' })
  status: string;

  @ApiProperty({ description: 'Check-in time' })
  checkInTime?: Date;

  @ApiProperty({ description: 'Check-out time' })
  checkOutTime?: Date;

  @ApiProperty({ description: 'Notes' })
  notes?: string;

  @ApiProperty({ description: 'Class information' })
  class: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Subject information' })
  subject?: {
    id: string;
    name: string;
  };
}

export class ParentChildrenResponseDto {
  @ApiProperty({ description: 'List of children', type: [StudentDto] })
  children: StudentDto[];

  @ApiProperty({ description: 'Total number of children' })
  total: number;
}

export class StudentAcademicRecordsResponseDto {
  @ApiProperty({ description: 'Student information' })
  student: StudentDto;

  @ApiProperty({ description: 'Academic records', type: [AcademicRecordDto] })
  academicRecords: AcademicRecordDto[];

  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Average GPA' })
  averageGpa: number;

  @ApiProperty({ description: 'Overall grade' })
  overallGrade: string;
}

export class StudentAttendanceResponseDto {
  @ApiProperty({ description: 'Student information' })
  student: StudentDto;

  @ApiProperty({ description: 'Attendance records', type: [AttendanceRecordDto] })
  attendanceRecords: AttendanceRecordDto[];

  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Attendance percentage' })
  attendancePercentage: number;

  @ApiProperty({ description: 'Present days' })
  presentDays: number;

  @ApiProperty({ description: 'Absent days' })
  absentDays: number;

  @ApiProperty({ description: 'Late days' })
  lateDays: number;
}

export class StudentGradesResponseDto {
  @ApiProperty({ description: 'List of students with their grades', type: [StudentAcademicRecordsResponseDto] })
  students: StudentAcademicRecordsResponseDto[];

  @ApiProperty({ description: 'Total number of students' })
  total: number;
}
