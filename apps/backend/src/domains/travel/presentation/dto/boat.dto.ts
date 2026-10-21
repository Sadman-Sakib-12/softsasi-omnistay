import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoatDto {
  @ApiProperty({ example: 'Azimut 60 Flybridge Luxury Yacht', description: 'Vessel title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({ example: 'azimut-60-flybridge', description: 'URL slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'luxury_yacht', description: 'Vessel type: luxury_yacht, catamaran, speedboat, gulet' })
  @IsString()
  @IsNotEmpty()
  vesselType!: string;

  @ApiPropertyOptional({ example: 18.5, description: 'Length in meters' })
  @IsNumber()
  @IsOptional()
  lengthMeters?: number;

  @ApiProperty({ example: 12, description: 'Max day cruising passengers' })
  @IsInt()
  @Min(1)
  guestCapacity!: number;

  @ApiPropertyOptional({ example: 6, default: 2, description: 'Overnight sleeping berths' })
  @IsInt()
  @IsOptional()
  @Min(0)
  berthsCount?: number;

  @ApiProperty({ example: 1800.0, description: 'Daily charter rate' })
  @IsNumber()
  @Min(0)
  dailyPrice!: number;

  @ApiPropertyOptional({ example: 'crewed', default: 'skippered', description: 'Charter type: bareboat, skippered, crewed' })
  @IsString()
  @IsOptional()
  charterType?: string;

  @ApiPropertyOptional({ example: 'available', default: 'available' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: [
      { name: 'Master King Suite', bedType: 'King', hasEnSuite: true },
      { name: 'VIP Queen Cabin', bedType: 'Queen', hasEnSuite: true },
    ],
    description: 'Staterooms & layout',
  })
  @IsArray()
  @IsOptional()
  staterooms?: Array<{ name: string; bedType?: string; hasEnSuite?: boolean }>;

  @ApiPropertyOptional({
    example: [
      { role: 'Captain', crewCount: 1, isIncluded: true },
      { role: 'Private Chef', crewCount: 1, isIncluded: true },
    ],
    description: 'Crew details',
  })
  @IsArray()
  @IsOptional()
  crewing?: Array<{ role: string; crewCount?: number; isIncluded?: boolean }>;
}

export class UpdateBoatDto {
  @ApiPropertyOptional({ example: 'Azimut 60 Flybridge (Refitted 2026)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 2000.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  dailyPrice?: number;

  @ApiPropertyOptional({ example: 'available' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class BookBoatDto {
  @ApiProperty({ example: 'boat-uuid-1', description: 'Boat UUID' })
  @IsString()
  @IsNotEmpty()
  boatId!: string;

  @ApiProperty({ example: '2026-12-01T09:00:00Z', description: 'Charter start timestamp' })
  @IsString()
  @IsNotEmpty()
  charterStart!: string;

  @ApiProperty({ example: '2026-12-03T18:00:00Z', description: 'Charter end timestamp' })
  @IsString()
  @IsNotEmpty()
  charterEnd!: string;
}
