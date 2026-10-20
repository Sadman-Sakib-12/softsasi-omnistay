import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordWastageDto {
  @ApiProperty({ description: 'Product ID lost or spoiled' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 4.5, description: 'Quantity spoiled or broken' })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ example: 'Expired dairy / broken wine bottle in cellar transit' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ example: 145.0, description: 'Financial cost write-off value' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costLost?: number;
}

export class PhysicalStocktakeAdjustmentDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 42.0, description: 'Physical count found on shelves' })
  @IsNumber()
  @Min(0)
  physicalCount!: number;

  @ApiPropertyOptional({ example: 'Monthly physical inventory variance adjustment' })
  @IsString()
  @IsOptional()
  reason?: string;
}
