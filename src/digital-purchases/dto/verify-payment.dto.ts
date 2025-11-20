import { IsString, IsOptional, IsArray } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  purchaseId: string;

  @IsString()
  paymentReference: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

