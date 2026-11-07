import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaasPlanDto {
  @ApiProperty({ example: 'Starter Boutique' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'starter' })
  @IsString()
  code: string;

  @ApiProperty({ example: 49.00 })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ example: 490.00 })
  @IsNumber()
  @Min(0)
  annualPrice: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  maxProperties: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(1)
  maxRooms: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  maxOutlets: number;

  @ApiPropertyOptional({ example: ['PMS', 'Booking Engine', 'Email Support'] })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SubscribePlanDto {
  @ApiProperty({ example: 'professional' })
  @IsString()
  planCode: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'annual'] })
  @IsEnum(['monthly', 'annual'])
  billingCycle: 'monthly' | 'annual';

  @ApiPropertyOptional({ example: 'stripe' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class CreatePlanRequestDto {
  @ApiProperty({ example: 'enterprise' })
  @IsString()
  planCode: string;

  @ApiProperty({ example: 'annual', enum: ['monthly', 'annual'] })
  @IsEnum(['monthly', 'annual'])
  billingCycle: 'monthly' | 'annual';

  @ApiPropertyOptional({ example: 'Need custom 50-property chain setup with SLA' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ToggleFeatureFlagDto {
  @ApiProperty({ example: 'ai_concierge' })
  @IsString()
  flagKey: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ example: 'Enable multimodal LLM concierge for all tenants' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CookieConsentDto {
  @ApiProperty({ example: ['necessary', 'analytics', 'marketing'] })
  consentTypes: string[];

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
