import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;

  @IsString()
  marketplaceItemId: string;
}

export class UpdateRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;
}
