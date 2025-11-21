import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRevenueDto {
  @ApiProperty({ example: 'PTA Fees' })
  @IsString()
  source: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'NGN', default: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Additional Revenue' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'PTA contribution for school development', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-05-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'REV001' })
  @IsString()
  reference: string;
}

