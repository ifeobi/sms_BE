import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
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

  // Exclude fields that shouldn't be sent to backend
  @Exclude()
  formattedAddress?: string;
  @Exclude()
  latitude?: number;
  @Exclude()
  longitude?: number;
}

export class RegisterDto {
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
  @ApiProperty({ enum: UserType, example: UserType.CREATOR })
  @IsEnum(UserType)
  userType: UserType;

  // Optional Contact Information
  @Expose()
  @ApiProperty({ example: '+2348012345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @Expose()
  @ApiProperty({ example: 'https://mywebsite.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @Expose()
  @ApiProperty({ example: 'NG', description: 'Country code', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @Expose()
  @ApiProperty({ example: 'I am a passionate educator...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @Expose()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  // Creator-specific fields
  @Expose()
  @ApiProperty({
    type: [String],
    example: ['mathematics', 'science', 'english'],
    description: 'Content categories the creator specializes in',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @Expose()
  @ApiProperty({
    example: 'free',
    description: 'Creator plan: free, premium, pro',
    required: false,
  })
  @IsOptional()
  @IsString()
  plan?: string;

  // Exclude fields that shouldn't be sent to backend
  @Exclude()
  confirmPassword?: string;
}
