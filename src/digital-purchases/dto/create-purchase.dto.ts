import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDigitalPurchaseDto {
  @IsString()
  marketplaceItemId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  beneficiaryStudentIds?: string[]; // For parent purchases - which children get access

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  giftMessage?: string; // Optional message from parent to child
}
