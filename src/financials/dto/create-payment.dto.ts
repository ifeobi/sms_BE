import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'student-id-123' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({ example: 'parent-id-456' })
  @IsOptional()
  @IsString()
  payerId?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'NGN', default: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'School Fees' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Card', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ example: 'PAY123456' })
  @IsString()
  reference: string;

  @ApiProperty({ example: 'TXN123456', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ example: '2024-05-01T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiProperty({ example: 'Payment notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'invoice-id-123', required: false })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiProperty({ example: 'https://receipt.url', required: false })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

