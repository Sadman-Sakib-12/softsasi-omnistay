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

export class CreateTicketTierDto {
  @ApiProperty({ example: 'VIP All-Access', description: 'Tier name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 250.0, description: 'Ticket price' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 100, description: 'Allocated total seats' })
  @IsInt()
  @Min(1)
  totalSeats!: number;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Global Hospitality & Travel Summit 2026', description: 'Event title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({ example: 'global-travel-summit-2026', description: 'URL slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'conference', description: 'Event type: summit, conference, gala, concert, workshop' })
  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @ApiProperty({ example: 'Grand Ballroom, OmniStay Bayfront Resort, Miami', description: 'Physical venue address' })
  @IsString()
  @IsNotEmpty()
  venueAddress!: string;

  @ApiProperty({ example: '2026-11-20T08:00:00Z', description: 'Event start time' })
  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ example: '2026-11-22T18:00:00Z', description: 'Event end time' })
  @IsString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ example: 500, description: 'Total capacity limit' })
  @IsInt()
  @Min(1)
  maxCapacity!: number;

  @ApiPropertyOptional({ example: 'active', default: 'active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Tiered ticket classes' })
  @IsArray()
  @IsOptional()
  ticketTiers?: CreateTicketTierDto[];

  @ApiPropertyOptional({
    example: [{ sessionName: 'Keynote & AI Architecture', startTime: '2026-11-20T09:00:00Z', endTime: '2026-11-20T11:00:00Z' }],
  })
  @IsArray()
  @IsOptional()
  timeSlots?: Array<{ sessionName: string; startTime: string; endTime: string }>;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Global Hospitality Summit (Updated)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 600 })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxCapacity?: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class BookEventDto {
  @ApiProperty({ example: 'evt-uuid-1', description: 'Event UUID' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ example: 'tier-uuid-1', description: 'Ticket tier ID or name' })
  @IsString()
  @IsNotEmpty()
  ticketTierId!: string;

  @ApiProperty({ example: 2, description: 'Number of tickets' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class ScanQrTicketDto {
  @ApiProperty({ example: 'TCK-2026-X8F9A1', description: 'Unique ticket code or HMAC string' })
  @IsString()
  @IsNotEmpty()
  ticketCode!: string;

  @ApiPropertyOptional({ example: 'Main Entrance Gate A', default: 'Main Gate' })
  @IsString()
  @IsOptional()
  gateName?: string;
}
