import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddFolioChargeDto {
  @ApiProperty({
    example: 'pos_restaurant',
    description: 'Originating department: room, pos_restaurant, pos_bar, spa, laundry, minibar, other',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['room', 'pos_restaurant', 'pos_bar', 'spa', 'laundry', 'minibar', 'other'])
  department!: string;

  @ApiProperty({
    example: 45.5,
    description: 'Charge amount in folio currency',
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({
    example: 'Fine dining dinner room service: 2 Wagyu Ribeye & Pinot Noir',
    description: 'Itemized description of service rendered',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AddFolioPaymentDto {
  @ApiProperty({
    example: 120.0,
    description: 'Payment settlement amount',
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    example: 'credit_card',
    description: 'Payment method: cash, credit_card, stripe, digital_wallet, corporate_invoice',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['cash', 'credit_card', 'stripe', 'digital_wallet', 'corporate_invoice'])
  paymentMethod!: string;

  @ApiPropertyOptional({
    example: 'txn_stripe_pi_123456789',
    description: 'External payment transaction reference token or receipt number',
  })
  @IsString()
  @IsOptional()
  reference?: string;
}
