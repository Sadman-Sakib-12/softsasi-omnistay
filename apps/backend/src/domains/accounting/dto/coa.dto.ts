import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: '1010', description: 'Account code (USALI standard)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  code!: string;

  @ApiProperty({ example: 'Operating Bank Account (USD)', description: 'Account title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'asset',
    description: 'Account classification: asset, liability, equity, revenue, expense',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['asset', 'liability', 'equity', 'revenue', 'expense'])
  type!: string;

  @ApiPropertyOptional({
    example: 'current_asset',
    description: 'Sub-type classification (e.g. current_asset, room_revenue, opex)',
  })
  @IsString()
  @IsOptional()
  subType?: string;

  @ApiPropertyOptional({ example: 'parent-account-uuid', description: 'Parent account UUID for hierarchy' })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Primary Operating Bank Account' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'current_asset' })
  @IsString()
  @IsOptional()
  subType?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;
}
