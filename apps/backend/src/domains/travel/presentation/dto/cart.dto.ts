import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    example: 'hotel',
    description: 'Product vertical: hotel, tour, car, space, boat, event, flight',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['hotel', 'tour', 'car', 'space', 'boat', 'event', 'flight'])
  vertical!: string;

  @ApiProperty({ example: 'entity-uuid-1234', description: 'UUID of the entity (room type, tour, car, etc.)' })
  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @ApiProperty({ example: 'Deluxe Ocean Suite (5 Nights)', description: 'Item display title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 250.0, description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: '2026-11-10T14:00:00Z', description: 'Start date / Check-in date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-11-15T11:00:00Z', description: 'End date / Check-out date' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: { adults: 2, children: 1, pickupStation: 'Terminal 1' },
    description: 'Arbitrary structured metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCartItemDto {
  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: '2026-11-12T14:00:00Z' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-11-17T11:00:00Z' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CheckoutCartDto {
  @ApiProperty({ example: 'sess-omnistay-xyz123', description: 'Active checkout session ID' })
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @ApiPropertyOptional({ example: 'stripe', default: 'stripe', description: 'Payment method code' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: {
      fullName: 'Sadman Sakib',
      email: 'sakib@softsasi.com',
      phone: '+8801700000000',
    },
    description: 'Guest details for one-click guest checkout',
  })
  @IsOptional()
  guestDetails?: {
    fullName: string;
    email: string;
    phone?: string;
  };

  @ApiPropertyOptional({ example: 'SUMMER2026', description: 'Optional promo or coupon code' })
  @IsString()
  @IsOptional()
  couponCode?: string;
}
