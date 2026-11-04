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
  @ApiPropertyOptional({
    example: 'uuid-property-id',
    description: 'Property UUID where the reservation is placed',
  })
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({
    example: 'uuid-room-type-id',
    description: 'Room category / RoomType UUID',
  })
  @IsUUID()
  @IsOptional()
  roomTypeId?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Direct guest name',
  })
  @IsString()
  @IsOptional()
  guestName?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Direct guest email',
  })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiPropertyOptional({
    example: '+8801700000000',
    description: 'Direct guest phone',
  })
  @IsString()
  @IsOptional()
  guestPhone?: string;

  @ApiPropertyOptional({
    example: 'card',
    description: 'Selected payment method (card, bkash, nagad, wallet, bank, pay_at_hotel)',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: 'full',
    description: 'Selected payment mode (full, deposit_20, pay_at_hotel, wallet, corporate_invoice)',
  })
  @IsString()
  @IsOptional()
  paymentMode?: string;

  @ApiPropertyOptional({
    example: 'Quiet room on upper floor',
    description: 'Special requests or notes from guest',
  })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiPropertyOptional({
    example: 'OMNISTAY',
    description: 'Promotional discount code',
  })
  @IsString()
  @IsOptional()
  promoCode?: string;

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
