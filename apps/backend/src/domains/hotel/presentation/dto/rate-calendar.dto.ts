import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatePlanDto {
  @ApiProperty({
    example: 'Best Available Rate (BAR)',
    description: 'Name of the rate plan',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'BAR',
    description: 'Code of the rate plan (e.g. BAR, RO, BB, MAP)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({
    example: 'Standard flexible rate with breakfast included',
    description: 'Rate plan description and terms',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'BB',
    description: 'Meal plan code: EP (Room Only), CP (Continental Breakfast), BB (Bed & Breakfast), MAP (Half Board), AP (Full Board)',
    default: 'EP',
  })
  @IsString()
  @IsOptional()
  @IsIn(['EP', 'CP', 'BB', 'MAP', 'AP', 'AI'])
  mealPlan?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this is the default rate plan for the property',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class CreateSeasonalRateDto {
  @ApiProperty({
    example: 'High Summer Peak 2026',
    description: 'Name of the seasonal date band',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  seasonName!: string;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Start date of the seasonal period (YYYY-MM-DD)',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-08-31',
    description: 'End date of the seasonal period (YYYY-MM-DD)',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: 1.35,
    description: 'Multiplier applied to room base prices (e.g., 1.35 for +35% surge, 0.85 for 15% discount)',
    default: 1.0,
  })
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  multiplier!: number;
}

export class SetRoomAvailabilityDto {
  @ApiProperty({
    example: '2026-11-01',
    description: 'Start date of the availability block (YYYY-MM-DD)',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-11-15',
    description: 'End date of the availability block inclusive (YYYY-MM-DD)',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: 195.0,
    description: 'Daily rate for dates in the range',
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 10,
    description: 'Total room inventory available to sell on these dates',
  })
  @IsInt()
  @Min(0)
  totalInventory!: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Block arrivals on these dates (Closed to Arrival)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isClosedArrival?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Block departures on these dates (Closed to Departure)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isClosedDeparture?: boolean;

  @ApiPropertyOptional({
    example: 2,
    description: 'Minimum nights stay restriction',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  minStay?: number;

  @ApiPropertyOptional({
    example: 14,
    description: 'Maximum nights stay restriction',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxStay?: number;
}
