import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePosOutletDto {
  @ApiProperty({ example: 'Beachside Seafood Grill & Bar' })
  @IsString()
  @IsNotEmpty()
  outletName!: string;

  @ApiProperty({ enum: ['restaurant', 'bar', 'spa', 'gift_shop', 'room_service'], default: 'restaurant' })
  @IsEnum(['restaurant', 'bar', 'spa', 'gift_shop', 'room_service'])
  outletType!: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateDiningTableDto {
  @ApiProperty({ example: 'T-12' })
  @IsString()
  @IsNotEmpty()
  tableNumber!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 50 })
  @IsInt()
  @Min(1)
  @Max(50)
  seatingCap!: number;

  @ApiPropertyOptional({ enum: ['vacant', 'seated', 'cooking', 'dining', 'check_printed', 'cleaning'], default: 'vacant' })
  @IsEnum(['vacant', 'seated', 'cooking', 'dining', 'check_printed', 'cleaning'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 120, description: 'X coordinate on SVG canvas' })
  @IsInt()
  @IsOptional()
  posX?: number;

  @ApiPropertyOptional({ example: 340, description: 'Y coordinate on SVG canvas' })
  @IsInt()
  @IsOptional()
  posY?: number;
}

export class UpdateTablePositionDto {
  @ApiProperty({ example: 250 })
  @IsInt()
  posX!: number;

  @ApiProperty({ example: 400 })
  @IsInt()
  posY!: number;
}

export class TransferTableDto {
  @ApiProperty({ description: 'Source table ID', example: 'd4529f56-ba81-42cb-bbf1-81f9a2632551' })
  @IsString()
  @IsNotEmpty()
  sourceTableId!: string;

  @ApiProperty({ description: 'Target destination table ID', example: 'e7136009-3cc4-43ea-9c02-e2d41571fca2' })
  @IsString()
  @IsNotEmpty()
  targetTableId!: string;

  @ApiPropertyOptional({ description: 'Optional reason for table transfer' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class MergeTablesDto {
  @ApiProperty({ description: 'Primary table ID receiving the party', example: 'd4529f56-ba81-42cb-bbf1-81f9a2632551' })
  @IsString()
  @IsNotEmpty()
  primaryTableId!: string;

  @ApiProperty({ description: 'Secondary table IDs to merge into primary table', type: [String] })
  @IsNotEmpty()
  mergedTableIds!: string[];
}
