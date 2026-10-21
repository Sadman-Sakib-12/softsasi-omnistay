import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHotelDto {
  @ApiProperty({
    example: 'Grand Horizon Resort & Spa',
    description: 'Name of the hotel / property',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'GHR01',
    description: 'Property identifier code (alphanumeric, e.g. GHR01)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  code!: string;

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
}
