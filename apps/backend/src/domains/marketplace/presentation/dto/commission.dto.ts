import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CalculateCommissionDto {
  @ApiProperty({ description: 'Vendor UUID' })
  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @ApiProperty({ description: 'Booking UUID' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({ example: 1200.0, description: 'Gross booking subtotal' })
  @IsNumber()
  @Min(0)
  grossAmount!: number;

  @ApiPropertyOptional({ example: 'hotel', enum: ['hotel', 'tour', 'car', 'boat', 'event', 'space'] })
  @IsString()
  @IsOptional()
  vertical?: string;
}
