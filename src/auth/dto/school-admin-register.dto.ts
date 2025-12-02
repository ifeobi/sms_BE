import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Exclude, Expose } from 'class-transformer';

export enum UserType {
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  CREATOR = 'CREATOR',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum SchoolType {
  ELEMENTARY = 'ELEMENTARY',
  SECONDARY = 'SECONDARY',
  TERTIARY = 'TERTIARY',
}

export class AddressDto {
  @Expose()
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  street: string;

  @Expose()
  @ApiProperty({ example: 'Lagos' })
  @IsString()
  city: string;

  @Expose()
  @ApiProperty({ example: 'Lagos State' })
  @IsString()
  state: string;

  @Expose()
  @ApiProperty({ example: '100001', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @Expose()
  @ApiProperty({ example: 'Near Central Bank', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  formattedAddress?: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  latitude?: number;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  longitude?: number;
}

export class SchoolAdminRegisterDto {
  // Personal Information
  @Expose()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @Expose()
  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @Expose()
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @Expose()
  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @Expose()
  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @Expose()
  @ApiProperty({
    example: 'principal',
    description: 'Role in school: principal, vice_principal, admin, etc.',
  })
  @IsString()
  role: string;

  @Expose()
  @ApiProperty({ enum: UserType, example: UserType.SCHOOL_ADMIN })
  @IsEnum(UserType)
  userType: UserType;

  // School Information
  @Expose()
  @ApiProperty({ example: 'Academeka International School' })
  @IsString()
  schoolName: string;

  @Expose()
  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  phone: string;

  @Expose()
  @ApiProperty({ example: 'https://academeka.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @Expose()
  @ApiProperty({ example: 'NG', description: 'Country code' })
  @IsString()
  country: string;

  @Expose()
  @ApiProperty({
    type: [String],
    example: ['ELEMENTARY', 'SECONDARY'],
    description: 'Array of school types',
  })
  @IsArray()
  @IsString({ each: true })
  schoolTypes: string[];

  @Expose()
  @ApiProperty({
    type: [AddressDto],
    description: 'Array of school addresses',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  // Exclude fields that shouldn't be sent to backend
  @Exclude()
  confirmPassword?: string;
}
