import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreateLoyaltyTierDto {
  @ApiProperty({ example: 'Gold Elite' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 5000, description: 'Minimum lifetime points required' })
  @IsNumber()
  @Min(0)
  minPoints!: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Points multiplier per $1 spent' })
  @IsNumber()
  @IsOptional()
  multiplier?: number;

  @ApiPropertyOptional({
    example: {
      freeBreakfast: true,
      roomUpgrade: true,
      lateCheckout: '14:00',
    },
  })
  @IsObject()
  @IsOptional()
  perks?: Record<string, any>;
}

export class EarnPointsDto {
  @ApiProperty({ example: 250.0, description: 'Amount spent on reservation/dining' })
  @IsNumber()
  @Min(0)
  amountSpent!: number;

  @ApiProperty({ example: 'Completed 3-night stay at Oceanfront Villa' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class RedeemPointsDto {
  @ApiProperty({ example: 1000, description: 'Number of loyalty points to redeem (1000 pts = $10 discount)' })
  @IsNumber()
  @Min(100)
  pointsToRedeem!: number;

  @ApiProperty({ example: 'Checkout discount redemption' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
