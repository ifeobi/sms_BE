import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export enum UserType {
  TEACHER = 'TEACHER',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
}

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsNotEmpty()
  employeeNumber: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjects?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedClasses?: string[];

  @IsOptional()
  teacherAssignments?: Array<{
    classId: string;
    subjectId: string;
    academicYear: string;
    isFormTeacher?: boolean;
  }>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
