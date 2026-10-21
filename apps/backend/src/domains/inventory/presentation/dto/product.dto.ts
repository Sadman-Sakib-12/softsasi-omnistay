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

export class RecipeIngredientDto {
  @ApiProperty({ description: 'Raw ingredient Product ID' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 0.25, description: 'Quantity consumed per serving (e.g. 0.25 kg beef)' })
  @IsNumber()
  @Min(0.001)
  quantity!: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Prime Australian Wagyu Beef Striploin' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ING-BEEF-WAGYU-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiPropertyOptional({ example: '8901234567890', description: 'Barcode EAN-13 or Code-128' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Product category UUID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Unit of Measure UUID (e.g. kg, liter, piece)' })
  @IsString()
  @IsOptional()
  unitId?: string;

  @ApiProperty({ example: 32.5, description: 'Cost price per unit' })
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @ApiPropertyOptional({ example: 68.0, description: 'Retail or menu selling price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  retailPrice?: number;

  @ApiPropertyOptional({ default: false, description: 'True if product has recipe BOM (Bill of Materials)' })
  @IsBoolean()
  @IsOptional()
  isRecipe?: boolean;

  @ApiPropertyOptional({ type: [RecipeIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  @IsOptional()
  recipeIngredients?: RecipeIngredientDto[];
}
