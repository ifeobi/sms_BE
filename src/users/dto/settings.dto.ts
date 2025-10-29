import { IsOptional, IsObject, IsString, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

export class NotificationSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  gradeUpdates?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  attendanceAlerts?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  paymentReminders?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  eventNotifications?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  weeklyReports?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emergencyAlerts?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  schoolUpdates?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  teacherMessages?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  systemMaintenance?: boolean;
}

export class PrivacySettingsDto {
  @ApiProperty({ required: false, enum: ['public', 'private', 'friends'] })
  @IsOptional()
  @IsEnum(['public', 'private', 'friends'])
  profileVisibility?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowMessages?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  dataSharing?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  analytics?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  locationTracking?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  biometricAuth?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoLogout?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  rememberDevice?: boolean;
}

export class SecuritySettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  loginAlerts?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  passwordExpiry?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  deviceManagement?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  suspiciousActivity?: boolean;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  passwordStrength?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  loginAttempts?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  accountLockout?: number;
}

export class AppearanceSettingsDto {
  @ApiProperty({ required: false, enum: ['light', 'dark', 'auto'] })
  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false, enum: ['small', 'medium', 'large'] })
  @IsOptional()
  @IsEnum(['small', 'medium', 'large'])
  fontSize?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  colorScheme?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  animations?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  soundEffects?: boolean;
}

export class AccessibilitySettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  screenReader?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  keyboardNavigation?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  voiceCommands?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  largeText?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  colorBlindSupport?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  motionReduction?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  focusIndicators?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  altText?: boolean;
}

export class CommunicationSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiProperty({ required: false, enum: ['12h', '24h'] })
  @IsOptional()
  @IsEnum(['12h', '24h'])
  timeFormat?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emailFrequency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  smsLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  voiceLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoTranslate?: boolean;
}

export class UpdateSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  profile?: ProfileDataDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  notifications?: NotificationSettingsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  privacy?: PrivacySettingsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  security?: SecuritySettingsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  appearance?: AppearanceSettingsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  accessibility?: AccessibilitySettingsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  communication?: CommunicationSettingsDto;
}
