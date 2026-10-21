import {
  IsArray,
  IsBoolean,
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

export class CreateCarDto {
  @ApiProperty({ example: 'Mercedes-Benz E-Class 2026', description: 'Car model title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  title!: string;

  @ApiPropertyOptional({ example: 'mercedes-e-class-2026', description: 'URL slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'luxury_sedan', description: 'Vehicle category: compact, sedan, suv, luxury_sedan, electric, van' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ example: 'Automatic', default: 'Automatic' })
  @IsString()
  @IsOptional()
  transmission?: string;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsInt()
  @IsOptional()
  @Min(1)
  passengerSeats?: number;

  @ApiPropertyOptional({ example: 3, default: 2 })
  @IsInt()
  @IsOptional()
  @Min(0)
  baggageCount?: number;

  @ApiPropertyOptional({ example: 4, default: 4 })
  @IsInt()
  @IsOptional()
  @Min(2)
  doorCount?: number;

  @ApiPropertyOptional({ example: 'Hybrid', default: 'Gasoline' })
  @IsString()
  @IsOptional()
  fuelType?: string;

  @ApiProperty({ example: 120.0, description: 'Daily rental price' })
  @IsNumber()
  @Min(0)
  dailyPrice!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isUnlimitedMileage?: boolean;

  @ApiPropertyOptional({ example: 'available', default: 'available' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: [{ name: 'GPS Navigation', price: 15, priceType: 'per_day' }],
    description: 'Extra add-on services',
  })
  @IsArray()
  @IsOptional()
  extraServices?: Array<{ name: string; price: number; priceType?: string }>;

  @ApiPropertyOptional({
    example: [{ stationName: 'Airport Terminal 1', stationType: 'airport', dropoffFee: 0 }],
    description: 'Pickup / drop-off locations',
  })
  @IsArray()
  @IsOptional()
  pickupLocations?: Array<{ stationName: string; stationType?: string; dropoffFee?: number }>;
}

export class UpdateCarDto {
  @ApiPropertyOptional({ example: 'Mercedes-Benz E-Class AMG' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 140.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  dailyPrice?: number;

  @ApiPropertyOptional({ example: 'available' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class BookCarDto {
  @ApiProperty({ example: 'car-uuid-1', description: 'Car UUID' })
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @ApiProperty({ example: '2026-11-10T10:00:00Z', description: 'Pickup timestamp' })
  @IsString()
  @IsNotEmpty()
  pickupDate!: string;

  @ApiProperty({ example: '2026-11-14T10:00:00Z', description: 'Dropoff timestamp' })
  @IsString()
  @IsNotEmpty()
  dropoffDate!: string;

  @ApiPropertyOptional({ example: 'Airport Terminal 1' })
  @IsString()
  @IsOptional()
  pickupStation?: string;

  @ApiPropertyOptional({ example: 'Downtown Hotel Lobby' })
  @IsString()
  @IsOptional()
  dropoffStation?: string;
}
