import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'percentage', enum: ['percentage', 'fixed'] })
  @IsString()
  @IsNotEmpty()
  discountType!: string;

  @ApiProperty({ example: 20.0, description: 'Percentage off (e.g. 20) or fixed dollar amount (e.g. 50)' })
  @IsNumber()
  @Min(0.01)
  discountValue!: number;

  @ApiPropertyOptional({ example: 150.0, description: 'Minimum spend required' })
  @IsNumber()
  @IsOptional()
  minSpend?: number;

  @ApiPropertyOptional({ example: 500, description: 'Total max redemptions allowed across platform' })
  @IsNumber()
  @IsOptional()
  maxRedemptions?: number;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  validFrom!: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  validUntil!: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 250.0, description: 'Cart subtotal amount' })
  @IsNumber()
  @Min(0)
  subtotal!: number;
}
