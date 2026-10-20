import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Corporate Conference Lodging - 10 Rooms', description: 'Item description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 10, description: 'Quantity of units/rooms' })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 150.0, description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 75.0, default: 0, description: 'Applicable tax amount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'user-uuid-corp-1', description: 'Customer or Corporate client user UUID' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: '2026-11-01', description: 'Invoice issue date' })
  @IsString()
  @IsNotEmpty()
  issueDate!: string;

  @ApiProperty({ example: '2026-11-30', description: 'Invoice payment due date (Net 30)' })
  @IsString()
  @IsNotEmpty()
  dueDate!: string;

  @ApiProperty({ type: [CreateInvoiceItemDto], description: 'Itemized line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];

  @ApiPropertyOptional({ example: 0, description: 'Discount total' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountTotal?: number;
}

export class RecordInvoicePaymentDto {
  @ApiProperty({ example: 1575.0, description: 'Amount settled' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-11-15', description: 'Date of receipt' })
  @IsString()
  @IsNotEmpty()
  paymentDate!: string;

  @ApiPropertyOptional({ example: 'bank_transfer', default: 'bank_transfer' })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ example: 'WIRE-US-948291', description: 'Bank transfer reference or check number' })
  @IsString()
  @IsOptional()
  reference?: string;
}
