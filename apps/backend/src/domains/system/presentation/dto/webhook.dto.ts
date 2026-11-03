import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({
    example: 'https://webhook.site/my-endpoint',
    description: 'Target endpoint URL that will receive HTTP POST webhook dispatches',
  })
  @IsUrl({ require_tld: false }, { message: 'url must be a valid URL address' })
  @IsNotEmpty()
  url!: string;

  @ApiProperty({
    example: ['booking.created', 'booking.cancelled', 'pos.order_completed'],
    description: 'List of subscribed event topics. Use ["*"] for wildcard subscription.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  eventTypes!: string[];

  @ApiPropertyOptional({
    example: 'whsec_9b83b3e2182c4bc4a0ec8d80f8dbd8d8',
    description: 'Shared secret key for HMAC-SHA256 signature calculation. Generated automatically if omitted.',
  })
  @IsOptional()
  @IsString()
  secretKey?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the webhook endpoint is actively enabled for dispatches',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TestWebhookDto {
  @ApiPropertyOptional({
    example: 'booking.created',
    description: 'Event type to simulate for test ping dispatch',
    default: 'booking.created',
  })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({
    description: 'Optional custom test payload object',
  })
  @IsOptional()
  customPayload?: Record<string, any>;
}

