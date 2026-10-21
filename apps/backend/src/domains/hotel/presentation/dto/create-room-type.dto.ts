import {
  IsDecimal,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomTypeDto {
  @ApiProperty({
    example: 'Deluxe Ocean Suite',
    description: 'Title of the room type / category',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  title!: string;

  @ApiPropertyOptional({
    example: 'deluxe-ocean-suite',
    description: 'URL-friendly unique slug (auto-generated from title if omitted)',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 180.0,
    description: 'Standard base nightly price',
  })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Maximum adult capacity',
    default: 2,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(20)
  maxAdults?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Maximum children capacity',
    default: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10)
  maxChildren?: number;

  @ApiPropertyOptional({
    example: 45,
    description: 'Room area in square meters',
  })
  @IsInt()
  @IsOptional()
  @Min(5)
  squareMeters?: number;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Room type status (active, draft, archived)',
    default: 'active',
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'draft', 'archived'])
  status?: string;
}

export class UpdateRoomTypeDto {
  @ApiPropertyOptional({
    example: 'Deluxe Ocean Suite Premium',
    description: 'Updated title of the room category',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    example: 'deluxe-ocean-suite-premium',
    description: 'Updated unique slug',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 220.0,
    description: 'Updated base nightly price',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Updated max adult capacity',
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(20)
  maxAdults?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Updated max children capacity',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10)
  maxChildren?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Updated area in square meters',
  })
  @IsInt()
  @IsOptional()
  @Min(5)
  squareMeters?: number;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Updated status (active, draft, archived)',
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'draft', 'archived'])
  status?: string;
}
