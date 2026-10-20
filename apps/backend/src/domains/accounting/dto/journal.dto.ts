import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JournalItemInputDto {
  @ApiProperty({ example: 'acc-uuid-1', description: 'Account UUID in Chart of Accounts' })
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @ApiPropertyOptional({ example: 500.0, default: 0, description: 'Debit amount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  debit?: number;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Credit amount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  credit?: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 1.0, default: 1.0 })
  @IsNumber()
  @IsOptional()
  exchangeRate?: number;
}

export class CreateJournalEntryDto {
  @ApiProperty({ example: '2026-11-01', description: 'Entry date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional({ example: 'REF-REV-001', description: 'Transaction reference or voucher code' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'Night audit room revenue accrual', description: 'Detailed memo / description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'night_audit', description: 'Source subsystem: night_audit, folio, pos, payroll, purchase' })
  @IsString()
  @IsOptional()
  sourceModule?: string;

  @ApiProperty({ type: [JournalItemInputDto], description: 'List of balanced debit/credit line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalItemInputDto)
  items!: JournalItemInputDto[];

  @ApiPropertyOptional({ example: true, default: true, description: 'Post immediately to General Ledger' })
  @IsBoolean()
  @IsOptional()
  isPosted?: boolean;
}
