import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class IssueGiftCardDto {
  @ApiProperty({ example: 200.0, description: 'Gift card starting value' })
  @IsNumber()
  @Min(10)
  amount!: number;

  @ApiProperty({ example: 'recipient@luxuryholiday.com' })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail!: string;

  @ApiPropertyOptional({ example: 'sender@luxuryholiday.com' })
  @IsEmail()
  @IsOptional()
  senderEmail?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class RedeemGiftCardDto {
  @ApiProperty({ example: 'GFT-8492-ABCD-1928' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 75.0, description: 'Amount to redeem from card balance' })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
