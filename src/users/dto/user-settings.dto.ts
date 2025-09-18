import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @ApiProperty({ description: 'Enable email notifications', required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ description: 'Enable push notifications', required: false })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiProperty({ description: 'Enable SMS notifications', required: false })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiProperty({ description: 'Show email address in profile', required: false })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiProperty({ description: 'Show phone number in profile', required: false })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiProperty({ description: 'Profile visibility level', required: false })
  @IsOptional()
  @IsString()
  profileVisibility?: string;

  @ApiProperty({ description: 'User language preference', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'User timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Date format preference', required: false })
  @IsOptional()
  @IsString()
  dateFormat?: string;
}

export class UserSettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  emailNotifications: boolean;

  @ApiProperty()
  pushNotifications: boolean;

  @ApiProperty()
  smsNotifications: boolean;

  @ApiProperty()
  showEmail: boolean;

  @ApiProperty()
  showPhone: boolean;

  @ApiProperty()
  profileVisibility: string;

  @ApiProperty()
  language: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  dateFormat: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
