import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class AddPayoutMethodDto {
  @ApiProperty({ example: 'stripe_connect', enum: ['stripe_connect', 'paypal', 'bank_wire'] })
  @IsString()
  @IsNotEmpty()
  methodType!: string;

  @ApiProperty({
    example: {
      accountHolder: 'Azure Yacht Corp',
      routingNumber: '121000358',
      accountNumber: '9876543210',
      bankName: 'JPMorgan Chase',
    },
  })
  @IsObject()
  details!: Record<string, any>;
}

export class RequestWithdrawalDto {
  @ApiProperty({ example: 500.0, description: 'Withdrawal amount in USD (minimum $100)' })
  @IsNumber()
  @Min(100)
  amount!: number;

  @ApiPropertyOptional({ example: 'Payout for October reservation payouts' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ProcessPayoutDto {
  @ApiProperty({ description: 'Withdrawal UUID' })
  @IsString()
  @IsNotEmpty()
  withdrawalId!: string;

  @ApiPropertyOptional({ example: 'STRIPE-PAYOUT-9812984' })
  @IsString()
  @IsOptional()
  reference?: string;
}
