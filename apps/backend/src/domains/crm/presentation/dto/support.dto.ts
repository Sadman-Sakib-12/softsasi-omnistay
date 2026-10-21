import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'Lady Catherine' })
  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @ApiPropertyOptional({ example: 'guest@grandresort.com' })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiProperty({ example: 'Suite 402 AC digital thermostat showing error E-04' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiPropertyOptional({ example: 'high', enum: ['low', 'normal', 'high', 'urgent'] })
  @IsString()
  @IsOptional()
  priority?: string;
}

export class ReplySupportTicketDto {
  @ApiProperty({ example: 'staff', enum: ['staff', 'guest'] })
  @IsString()
  @IsNotEmpty()
  senderType!: string;

  @ApiProperty({ example: 'Our facilities engineer has been dispatched to Suite 402.' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class CreateCannedResponseDto {
  @ApiProperty({ example: '!wifi' })
  @IsString()
  @IsNotEmpty()
  shortcut!: string;

  @ApiProperty({ example: 'High-Speed Wi-Fi Details' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Connect to "OmniStay_VIP" network with password "LuxuryGuest2026".' })
  @IsString()
  @IsNotEmpty()
  response!: string;
}

export class CreateKnowledgeBaseItemDto {
  @ApiProperty({ example: 'Check-In Policy' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 'What are standard check-in and check-out times?' })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({ example: 'Standard check-in is 14:00 and check-out is 11:00 with 1 hour complimentary grace period.' })
  @IsString()
  @IsNotEmpty()
  answer!: string;
}
