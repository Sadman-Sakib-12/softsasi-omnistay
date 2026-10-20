import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemModifierDto {
  @ApiProperty({ example: 'Truffle Aioli Dip' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 'Prime Ribeye Steak 400g' })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 58.0 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 'Medium Rare, gluten-free sauce' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'KDS station assignment', example: 'grill' })
  @IsString()
  @IsOptional()
  stationType?: string;

  @ApiPropertyOptional({ type: [OrderItemModifierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemModifierDto)
  @IsOptional()
  modifiers?: OrderItemModifierDto[];
}

export class CreatePosOrderDto {
  @ApiProperty({ description: 'POS Outlet ID' })
  @IsString()
  @IsNotEmpty()
  outletId!: string;

  @ApiPropertyOptional({ description: 'POS Terminal Device ID' })
  @IsString()
  @IsOptional()
  terminalId?: string;

  @ApiPropertyOptional({ description: 'Dining Table ID' })
  @IsString()
  @IsOptional()
  tableId?: string;

  @ApiPropertyOptional({ example: 4, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  guestCount?: number;

  @ApiPropertyOptional({ example: 'John (Lead Server)' })
  @IsString()
  @IsOptional()
  serverName?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class SettlePosOrderDto {
  @ApiProperty({ enum: ['cash', 'card', 'room_charge', 'digital_wallet'], example: 'card' })
  @IsEnum(['cash', 'card', 'room_charge', 'digital_wallet'])
  paymentMode!: string;

  @ApiProperty({ example: 125.5 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ example: 15.0, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tipAmount?: number;

  @ApiPropertyOptional({ example: 'AUTH_TXN_987654' })
  @IsString()
  @IsOptional()
  reference?: string;
}

export class SplitCheckDto {
  @ApiProperty({ description: 'Number of even ways to split bill, or specific item splits', example: 2 })
  @IsInt()
  @Min(2)
  splitCount!: number;
}
