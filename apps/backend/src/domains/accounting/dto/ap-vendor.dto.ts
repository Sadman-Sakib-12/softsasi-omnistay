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

export class CreateBillItemDto {
  @ApiProperty({ example: 'Kitchen Pantry - Artisan Dairy & Cheese Supplies' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 25.0, description: 'Unit cost' })
  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class CreateBillDto {
  @ApiProperty({ example: 'VND-SUPPLY-001', description: 'Bill/Invoice number from supplier' })
  @IsString()
  @IsNotEmpty()
  billNumber!: string;

  @ApiPropertyOptional({ example: 'vendor-uuid-1', description: 'Vendor UUID' })
  @IsString()
  @IsOptional()
  vendorId?: string;

  @ApiPropertyOptional({ example: 'po-uuid-101', description: 'Purchase Order UUID for 3-way matching' })
  @IsString()
  @IsOptional()
  purchaseOrderId?: string;

  @ApiProperty({ example: '2026-11-05', description: 'Bill date' })
  @IsString()
  @IsNotEmpty()
  billDate!: string;

  @ApiProperty({ example: '2026-11-20', description: 'Payment due date' })
  @IsString()
  @IsNotEmpty()
  dueDate!: string;

  @ApiProperty({ type: [CreateBillItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillItemDto)
  items!: CreateBillItemDto[];
}

export class ThreeWayMatchDto {
  @ApiProperty({ example: 'bill-uuid-1', description: 'Supplier bill UUID' })
  @IsString()
  @IsNotEmpty()
  billId!: string;

  @ApiProperty({ example: 'po-uuid-1', description: 'Purchase Order UUID' })
  @IsString()
  @IsNotEmpty()
  purchaseOrderId!: string;

  @ApiPropertyOptional({ example: 'grn-uuid-1', description: 'Goods Receipt Note UUID' })
  @IsString()
  @IsOptional()
  grnId?: string;
}

export class RecordBillPaymentDto {
  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-11-18' })
  @IsString()
  @IsNotEmpty()
  paymentDate!: string;

  @ApiPropertyOptional({ example: 'bank_transfer', default: 'bank_transfer' })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ example: 'AP-CHK-5021' })
  @IsString()
  @IsOptional()
  reference?: string;
}

export class CreateDebitNoteDto {
  @ApiProperty({ example: 'bill-uuid-1' })
  @IsString()
  @IsNotEmpty()
  billId!: string;

  @ApiProperty({ example: 120.0, description: 'Debit adjustment amount' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'Spoiled dairy produce returned upon receiving inspection' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
