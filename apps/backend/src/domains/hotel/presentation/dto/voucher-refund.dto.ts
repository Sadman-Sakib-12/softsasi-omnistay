import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CancelWithRefundDto {
  @ApiPropertyOptional({
    example: 'Flight was rescheduled due to bad weather',
    description: 'Guest or front-desk reason for reservation cancellation',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    example: 'flexible',
    description: 'Cancellation policy tier to enforce: flexible, moderate, strict',
    default: 'flexible',
  })
  @IsOptional()
  @IsString()
  @IsIn(['flexible', 'moderate', 'strict'])
  policyTier?: 'flexible' | 'moderate' | 'strict';
}

