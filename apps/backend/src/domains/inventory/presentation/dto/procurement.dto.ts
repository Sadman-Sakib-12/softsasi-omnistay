import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class PurchaseOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 100, description: 'Quantity ordered' })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ example: 12.5, description: 'Agreed unit cost' })
  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class CreatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Supplier / Vendor UUID' })
  @IsString()
  @IsOptional()
  vendorId?: string;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];
}

export class GrnItemInspectionDto {
  @ApiProperty({ example: 'Fresh Organic Whole Milk' })
  @IsString()
  @IsNotEmpty()
  itemTitle!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  qtyOrdered!: number;

  @ApiProperty({ example: 98, description: 'Actual accepted delivery count' })
  @IsNumber()
  @Min(0)
  qtyReceived!: number;

  @ApiPropertyOptional({ example: false, description: 'True if carton arrived damaged' })
  @IsBoolean()
  @IsOptional()
  isDamaged?: boolean;
}

export class CreateGoodsReceivedNoteDto {
  @ApiProperty({ description: 'Associated Purchase Order ID' })
  @IsString()
  @IsNotEmpty()
  purchaseId!: string;

  @ApiProperty({ type: [GrnItemInspectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrnItemInspectionDto)
  items!: GrnItemInspectionDto[];
}

export class ThreeWayMatchDto {
  @ApiProperty({ description: 'Purchase Order ID' })
  @IsString()
  @IsNotEmpty()
  purchaseId!: string;

  @ApiProperty({ description: 'Goods Received Note ID' })
  @IsString()
  @IsNotEmpty()
  grnId!: string;

  @ApiProperty({ example: 1250.0, description: 'Vendor invoice billed amount' })
  @IsNumber()
  @Min(0.01)
  billedAmount!: number;

  @ApiPropertyOptional({ example: 'INV-VENDOR-2026-991' })
  @IsString()
  @IsOptional()
  vendorInvoiceNumber?: string;
}
