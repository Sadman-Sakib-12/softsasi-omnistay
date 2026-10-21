import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TopUpWalletDto {
  @ApiProperty({ example: 250.0, description: 'Amount to add to digital wallet' })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Stripe Card Payment *4242' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class DebitWalletDto {
  @ApiProperty({ example: 120.0, description: 'Amount to debit for booking checkout' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ description: 'Booking or Transaction reference' })
  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @ApiPropertyOptional({ example: '1-click checkout for Deluxe Suite reservation' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class RefundToWalletDto {
  @ApiProperty({ example: 120.0, description: 'Amount refunded instantly to wallet' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ description: 'Booking reference' })
  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @ApiPropertyOptional({ example: 'Instant cancellation refund' })
  @IsString()
  @IsOptional()
  description?: string;
}
