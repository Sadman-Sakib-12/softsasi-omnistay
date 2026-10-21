import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GenerateReferralLinkDto {
  @ApiPropertyOptional({ example: 'SUMMER26' })
  @IsString()
  @IsOptional()
  customCode?: string;
}

export class RewardReferralBookingDto {
  @ApiProperty({ example: 'REF-SUMMER26' })
  @IsString()
  @IsNotEmpty()
  referralCode!: string;

  @ApiProperty({ description: 'Confirmed Booking UUID' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiPropertyOptional({ example: 25.0, description: 'Referral reward incentive amount' })
  @IsNumber()
  @IsOptional()
  rewardAmount?: number;
}
