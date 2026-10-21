import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingGuestDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full legal name of the guest',
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({
    example: 'johndoe@example.com',
    description: 'Guest email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: '+8801712345678',
    description: 'Guest mobile phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether this guest is the primary contact',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    example: 'A12345678',
    description: 'Passport or National ID number',
  })
  @IsString()
  @IsOptional()
  passportNo?: string;
}

export class CreateBookingDto {
  @ApiProperty({
    example: 'uuid-property-id',
    description: 'Property UUID where the reservation is placed',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId!: string;

  @ApiProperty({
    example: 'uuid-room-type-id',
    description: 'Room category / RoomType UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  roomTypeId!: string;

  @ApiProperty({
    example: '2026-11-10',
    description: 'Check-in arrival date (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  checkInDate!: string;

  @ApiProperty({
    example: '2026-11-14',
    description: 'Check-out departure date (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  checkOutDate!: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of adult guests',
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of child guests',
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({
    example: 100.0,
    description: 'Advance deposit amount collected at checkout',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  depositAmount?: number;

  @ApiPropertyOptional({
    type: [BookingGuestDto],
    description: 'List of registered guests for the reservation',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BookingGuestDto)
  guests?: BookingGuestDto[];
}
