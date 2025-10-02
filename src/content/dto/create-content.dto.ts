import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ContentType, LicenseType, Visibility, ContentStatus } from '@prisma/client';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  contentCategoryId: string;

  @IsString()
  subjectCategoryId: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  // Textbook specific fields
  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  edition?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  isbn?: string;

  // Textbook Physical Delivery fields
  @IsOptional()
  @IsString()
  physicalDeliveryMethod?: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  deliveryAvailability?: string;

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  // Textbook Digital Delivery fields
  @IsOptional()
  @IsString()
  digitalDeliveryMethod?: string;

  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @IsOptional()
  @IsString()
  fileSizeFormat?: string;

  @IsOptional()
  @IsString()
  supportContact?: string;

  // Video Content specific fields
  @IsOptional()
  @IsString()
  videoDuration?: string;

  @IsOptional()
  @IsString()
  videoDeliveryMethod?: string;

  // Worksheet Content specific fields
  @IsOptional()
  @IsString()
  worksheetGrade?: string;

  @IsOptional()
  @IsString()
  worksheetFormat?: string;

  // Assignment Content specific fields
  @IsOptional()
  @IsString()
  assignmentGrade?: string;

  @IsOptional()
  @IsString()
  assignmentFormat?: string;

  @IsOptional()
  @IsString()
  assignmentLength?: string;

  // Past Questions Content specific fields
  @IsOptional()
  @IsString()
  examBody?: string;

  @IsOptional()
  @IsString()
  examYears?: string;

  @IsOptional()
  @IsString()
  examLevel?: string;

  @IsOptional()
  @IsString()
  pastQuestionsFormat?: string;

  @IsOptional()
  @IsString()
  pastQuestionsPages?: string;

  // Audio Book Content specific fields
  @IsOptional()
  @IsString()
  audiobookAuthor?: string;

  @IsOptional()
  @IsString()
  audiobookNarrator?: string;

  @IsOptional()
  @IsString()
  audiobookDuration?: string;

  @IsOptional()
  @IsString()
  audiobookLanguage?: string;

  @IsOptional()
  @IsString()
  audiobookFormat?: string;

  // Interactive Content specific fields
  @IsOptional()
  @IsString()
  interactiveFormat?: string;

  @IsOptional()
  @IsString()
  interactiveLevel?: string;

  @IsOptional()
  @IsString()
  interactiveDuration?: string;

  @IsOptional()
  @IsString()
  interactiveLink?: string;

  // Notes Content specific fields
  @IsOptional()
  @IsString()
  notesLevel?: string;

  @IsOptional()
  @IsString()
  notesFormat?: string;

  @IsOptional()
  @IsString()
  notesLength?: string;

  // Pricing
  @IsOptional()
  @IsNumber()
  digitalPrice?: number;

  @IsOptional()
  @IsNumber()
  physicalPrice?: number;

  @IsOptional()
  @IsNumber()
  videoPrice?: number;

  @IsOptional()
  @IsNumber()
  worksheetPrice?: number;

  @IsOptional()
  @IsNumber()
  assignmentPrice?: number;

  @IsOptional()
  @IsNumber()
  pastQuestionsPrice?: number;

  @IsOptional()
  @IsNumber()
  audiobookPrice?: number;

  @IsOptional()
  @IsNumber()
  interactivePrice?: number;

  @IsOptional()
  @IsNumber()
  notesPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  // Licensing & Visibility
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  // Tags/Keywords
  @IsOptional()
  tags?: any;

  // Status
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

