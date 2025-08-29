import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User type for the account',
    example: 'PARENT',
    enum: ['PARENT', 'STUDENT', 'SCHOOL_ADMIN', 'TEACHER', 'CREATOR'],
  })
  @IsString()
  @IsNotEmpty()
  userType: string;
}
