import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ example: 'Supplies' })
  @IsString()
  category: string;

  @ApiProperty({ example: '2024/2025' })
  @IsString()
  academicYear: string;

  @ApiProperty({ example: 'First Term', required: false })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  budgetedAmount: number;

  @ApiProperty({ example: 'NGN', default: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Budget for office supplies', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

