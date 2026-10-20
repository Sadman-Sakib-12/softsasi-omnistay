import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Central Cold Storage & Kitchen Depot' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'WH-CENTRAL-01' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Resort Basement Level B1, Bay 4' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateWarehouseBinDto {
  @ApiProperty({ example: 'BIN-FREEZER-A1' })
  @IsString()
  @IsNotEmpty()
  binCode!: string;

  @ApiPropertyOptional({ example: 'Cold Zone Meat Storage' })
  @IsString()
  @IsOptional()
  zone?: string;
}

export class InitiateStockTransferDto {
  @ApiProperty({ description: 'Origin warehouse ID' })
  @IsString()
  @IsNotEmpty()
  fromWarehouseId!: string;

  @ApiProperty({ description: 'Destination warehouse ID' })
  @IsString()
  @IsNotEmpty()
  toWarehouseId!: string;

  @ApiProperty({ description: 'Product ID being moved' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 50.0, description: 'Quantity transferred (e.g. 50 bottles of wine)' })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiPropertyOptional({ example: 'Restocking Rooftop Bar for Saturday Gala' })
  @IsString()
  @IsOptional()
  reason?: string;
}
