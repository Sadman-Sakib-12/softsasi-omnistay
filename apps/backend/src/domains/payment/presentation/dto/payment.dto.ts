import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Payment gateway code: stripe, paypal, sslcommerz, bkash, razorpay', example: 'stripe' })
  @IsString()
  @IsNotEmpty()
  gateway!: string;

  @ApiProperty({ description: 'Booking reservation UUID', example: 'bk-uuid-001' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({ description: 'Amount to pay', example: 250.0 })
  @IsNumber()
  @Min(0.5)
  amount!: number;

  @ApiPropertyOptional({ description: 'Currency ISO code', default: 'USD', example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Customer billing email', example: 'guest@luxuryhotel.com' })
  @IsString()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiPropertyOptional({ description: 'Customer full name', example: 'Sadman Sakib' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Redirect return URL after payment completion' })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Payment gateway code: stripe, paypal, sslcommerz, bkash, razorpay', example: 'stripe' })
  @IsString()
  @IsNotEmpty()
  gateway!: string;

  @ApiProperty({ description: 'Gateway transaction or payment intent ID', example: 'pi_3MtwBwLkdIwHu7ix28a3tqPa' })
  @IsString()
  @IsNotEmpty()
  transactionId!: string;
}

export class SubmitOfflineSlipDto {
  @ApiProperty({ description: 'Booking reservation UUID' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({ description: 'Bank institution name', example: 'Standard Chartered Bank' })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ description: 'Deposit slip / reference transaction number', example: 'DEP-8839211' })
  @IsString()
  @IsNotEmpty()
  slipNumber!: string;

  @ApiProperty({ description: 'Uploaded photo/document URL of deposit slip' })
  @IsString()
  @IsNotEmpty()
  slipFileUrl!: string;

  @ApiProperty({ description: 'Amount deposited', example: 1200.0 })
  @IsNumber()
  @Min(1)
  amount!: number;
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Payment gateway code', example: 'stripe' })
  @IsString()
  @IsNotEmpty()
  gateway!: string;

  @ApiProperty({ description: 'Original gateway transaction ID to refund' })
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @ApiPropertyOptional({ description: 'Amount to refund (omit for full refund)', example: 250.0 })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Refund justification reason' })
  @IsString()
  @IsOptional()
  reason?: string;
}
