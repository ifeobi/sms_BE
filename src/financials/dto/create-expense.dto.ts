import { IsString, IsNumber, IsOptional, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Supplies' })
  @IsString()
  category: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'NGN', default: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Stationery and office supplies' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Office Supplies Ltd', required: false })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiProperty({ example: '2024-05-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: ['https://receipt1.url', 'https://receipt2.url'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  receiptUrls?: string[];
}

