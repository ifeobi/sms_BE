import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeeStructureDto {
  @ApiProperty({ example: 'Tuition Fee' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Annual tuition fee', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'NGN', default: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Tuition' })
  @IsString()
  category: string;

  @ApiProperty({ example: '2024/2025' })
  @IsString()
  academicYear: string;

  @ApiProperty({ example: 'First Term', required: false })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiProperty({ example: '2024-09-01', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  allowsInstallment?: boolean;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxInstallments?: number;
}

