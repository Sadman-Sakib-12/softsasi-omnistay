import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class YieldPricingQueryDto {
  @ApiPropertyOptional({
    example: '2026-11-01',
    description: 'Target check-in start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-11-03',
    description: 'Target check-out end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'b1234567-89ab-cdef-0123-456789abcdef',
    description: 'Filter calculations for a specific Room Type UUID',
  })
  @IsOptional()
  @IsUUID()
  roomTypeId?: string;
}

