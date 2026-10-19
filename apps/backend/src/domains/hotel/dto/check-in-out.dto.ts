import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    example: 'uuid-booking-id',
    description: 'Booking reservation UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({
    example: 'uuid-room-id',
    description: 'Specific physical room unit UUID assigned to guest',
  })
  @IsUUID()
  @IsNotEmpty()
  roomId!: string;

  @ApiPropertyOptional({
    example: 'RFID-KEY-10492',
    description: 'Electronic door lock / RFID keycard ID encoded for guest',
  })
  @IsString()
  @IsOptional()
  keycardCode?: string;

  @ApiPropertyOptional({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    description: 'Captured digital signature of guest confirming terms',
  })
  @IsString()
  @IsOptional()
  digitalSignature?: string;
}

export class CheckOutDto {
  @ApiProperty({
    example: 'uuid-booking-id',
    description: 'Booking reservation UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Force checkout even if outstanding balance due exists on folio',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  forceOverrideUnpaid?: boolean;

  @ApiPropertyOptional({
    example: 'Checked out on time. All keys returned.',
    description: 'Operational notes on checkout',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
