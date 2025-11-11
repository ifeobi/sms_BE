import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, ValidateNested, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

export class ParentInfoDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;
}

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class CreateStudentDto {
  // Student basic info
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  gender: string;

  @IsString()
  classLevel: string;

  @IsString()
  academicYear: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  // Optionals
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  allergies?: string[];

  @IsOptional()
  medications?: string[];

  @IsOptional()
  @IsString()
  specialNeeds?: string;

  // Parent
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ParentInfoDto)
  parentInfo: ParentInfoDto;

  @IsEnum(RelationshipType)
  relationship: RelationshipType;

  // Link to existing parent mode
  @IsOptional()
  @IsString()
  existingParentId?: string;
}
