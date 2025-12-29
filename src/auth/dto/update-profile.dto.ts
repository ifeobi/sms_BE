import { IsOptional, IsString, IsArray, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+2348012345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://mywebsite.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'NG', description: 'Country code', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'I am a passionate educator...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  // Teacher-specific fields
  @ApiProperty({ example: 'EMP001', description: 'Employee number', required: false })
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiProperty({ example: 'Mathematics', description: 'Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  // Creator-specific fields
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

  @ApiProperty({
    example: 'free',
    description: 'Creator plan: free, premium, pro',
    required: false,
  })
  @IsOptional()
  @IsString()
  plan?: string;
}
