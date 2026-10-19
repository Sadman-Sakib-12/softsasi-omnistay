import {
  IsDecimal,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHotelDto {
  @ApiPropertyOptional({
    example: 'Grand Horizon Resort & Spa',
    description: 'Name of the hotel / property',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'Asia/Dhaka',
    description: 'IANA timezone of the property location',
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Default operating currency code (ISO 4217)',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    example: 'resort',
    description: 'Property type classification (hotel, resort, villa, bnb)',
  })
  @IsString()
  @IsOptional()
  @IsIn(['hotel', 'resort', 'villa', 'bnb', 'serviced_apartment'])
  propertyType?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Star rating from 1 to 5',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  starRating?: number;

  @ApiPropertyOptional({
    example: '402 Swarupdaha, Poradaha, Kushtia-7031',
    description: 'Physical property address',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 23.8103,
    description: 'Latitude geolocation coordinate',
  })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({
    example: 90.4125,
    description: 'Longitude geolocation coordinate',
  })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional({
    example: '14:00',
    description: 'Standard check-in time (HH:mm)',
  })
  @IsString()
  @IsOptional()
  checkInTime?: string;

  @ApiPropertyOptional({
    example: '11:00',
    description: 'Standard check-out time (HH:mm)',
  })
  @IsString()
  @IsOptional()
  checkOutTime?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Operational status (active, suspended, maintenance)',
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'suspended', 'maintenance'])
  status?: string;
}
