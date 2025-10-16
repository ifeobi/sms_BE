import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDigitalPurchaseDto {
  @IsString()
  marketplaceItemId: string;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
