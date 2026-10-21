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

export class CreateTourItineraryDto {
  @ApiProperty({ example: 1, description: 'Day number' })
  @IsInt()
  @Min(1)
  dayNumber!: number;

  @ApiProperty({ example: 'Harbor Departure & Snorkeling', description: 'Day title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Pick up from lobby, transfer to marina, boat ride to coral reef' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 21.4225 })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: 39.8262 })
  @IsNumber()
  @IsOptional()
  lng?: number;
}

export class CreateTourDto {
  @ApiProperty({ example: 'Red Sea Coral Reef 3-Day Expedition', description: 'Tour title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({ example: 'red-sea-coral-reef-3-day', description: 'URL slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 3, description: 'Duration in days' })
  @IsInt()
  @Min(1)
  durationDays!: number;

  @ApiPropertyOptional({ example: 72, description: 'Duration in hours' })
  @IsInt()
  @IsOptional()
  @Min(1)
  durationHours?: number;

  @ApiPropertyOptional({ example: 2, description: 'Minimum passengers' })
  @IsInt()
  @IsOptional()
  @Min(1)
  minPax?: number;

  @ApiPropertyOptional({ example: 16, description: 'Maximum passengers' })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxPax?: number;

  @ApiProperty({ example: 350.0, description: 'Base adult price' })
  @IsNumber()
  @Min(0)
  basePriceAdult!: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Day-by-day itineraries' })
  @IsArray()
  @IsOptional()
  itineraries?: CreateTourItineraryDto[];

  @ApiPropertyOptional({
    example: [
      { name: 'Adult', price: 350, minAge: 18 },
      { name: 'Child', price: 200, minAge: 4, maxAge: 17 },
      { name: 'Infant', price: 0, minAge: 0, maxAge: 3 },
    ],
    description: 'Tiered age-based person types',
  })
  @IsArray()
  @IsOptional()
  personTypes?: Array<{ name: string; price: number; minAge?: number; maxAge?: number }>;

  @ApiPropertyOptional({
    example: ['Buffet Lunch', 'Snorkeling Equipment', 'Hotel Transfer'],
    description: 'Included services',
  })
  @IsArray()
  @IsOptional()
  inclusions?: string[];
}

export class UpdateTourDto {
  @ApiPropertyOptional({ example: 'Red Sea Expedition Luxury Edition' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 400.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  basePriceAdult?: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class BookTourDto {
  @ApiProperty({ example: 'tour-uuid-1', description: 'Tour UUID' })
  @IsString()
  @IsNotEmpty()
  tourId!: string;

  @ApiProperty({ example: '2026-11-15', description: 'Booking departure date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  bookingDate!: string;

  @ApiProperty({ example: 2, description: 'Number of adults' })
  @IsInt()
  @Min(1)
  paxAdults!: number;

  @ApiPropertyOptional({ example: 1, description: 'Number of children' })
  @IsInt()
  @IsOptional()
  @Min(0)
  paxChildren?: number;
}
