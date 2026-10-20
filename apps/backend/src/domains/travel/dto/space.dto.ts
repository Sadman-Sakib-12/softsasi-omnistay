import {
  IsDecimal,
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

export class CreateSpaceDto {
  @ApiProperty({ example: 'Grand Executive Boardroom', description: 'Title of the venue/space' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({ example: 'grand-executive-boardroom', description: 'URL-friendly unique slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'meeting_room', description: 'Type of venue: hot_desk, meeting_room, conference_hall, ballroom' })
  @IsString()
  @IsNotEmpty()
  venueType!: string;

  @ApiProperty({ example: 75.0, description: 'Hourly price for booking the space' })
  @IsNumber()
  @Min(0)
  hourlyPrice!: number;

  @ApiPropertyOptional({ example: 450.0, description: 'Daily fixed-rate price' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  dailyPrice?: number;

  @ApiProperty({ example: 16, description: 'Maximum seated headcount / capacity' })
  @IsInt()
  @Min(1)
  capacityPax!: number;

  @ApiPropertyOptional({ example: 65, description: 'Floor area in square meters' })
  @IsInt()
  @IsOptional()
  @Min(1)
  squareMeters?: number;

  @ApiPropertyOptional({ example: 25.0, description: 'Mandatory sanitization cleaning fee' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cleaningFee?: number;

  @ApiPropertyOptional({ example: 100.0, description: 'Refundable security deposit against damage' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  securityDeposit?: number;

  @ApiPropertyOptional({ example: 'active', description: 'Status of space (active, maintenance, archived)' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: ['High-speed Wi-Fi 6', '4K Laser Projector', 'Zoom Room Soundbar'],
    description: 'List of amenities and audiovisual equipment',
  })
  @IsOptional()
  amenities?: string[];
}

export class UpdateSpaceDto {
  @ApiPropertyOptional({ example: 'Grand Executive Boardroom (Updated)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'meeting_room' })
  @IsString()
  @IsOptional()
  venueType?: string;

  @ApiPropertyOptional({ example: 85.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  hourlyPrice?: number;

  @ApiPropertyOptional({ example: 500.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  dailyPrice?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @IsOptional()
  @Min(1)
  capacityPax?: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class BookSpaceDto {
  @ApiProperty({ example: 'spc-uuid-1', description: 'Space UUID' })
  @IsString()
  @IsNotEmpty()
  spaceId!: string;

  @ApiProperty({ example: '2026-11-01T09:00:00Z', description: 'Start timestamp (ISO)' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: '2026-11-01T13:00:00Z', description: 'End timestamp (ISO)' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @ApiPropertyOptional({ example: 300.0, description: 'Total price calculation' })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;
}
