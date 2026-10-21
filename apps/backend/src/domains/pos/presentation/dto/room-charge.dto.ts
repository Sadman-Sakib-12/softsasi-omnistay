import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class VerifyRoomForChargeDto {
  @ApiProperty({ description: 'Hotel room number (e.g. 402 or 101)', example: '402' })
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;
}

export class ChargeToRoomDto {
  @ApiProperty({ description: 'POS Order ID' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: '402' })
  @IsString()
  @IsNotEmpty()
  roomNumber!: string;

  @ApiProperty({ example: 'David Miller' })
  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @ApiProperty({ example: 148.5 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ description: 'Base64 data URI of guest digital signature captured on POS screen' })
  @IsString()
  @IsOptional()
  signatureUrl?: string;
}
