import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Operating Treasury Account', description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  accountName!: string;

  @ApiProperty({ example: 'JPMorgan Chase & Co.', description: 'Bank institution name' })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ example: '984029482019', description: 'Account number / IBAN' })
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 25000.0, default: 0 })
  @IsNumber()
  @IsOptional()
  openingBalance?: number;

  @ApiPropertyOptional({ example: 'acc-uuid-1010', description: 'Linked COA account UUID' })
  @IsString()
  @IsOptional()
  accountId?: string;
}

export class BankTransferDto {
  @ApiProperty({ example: 'bank-acc-1', description: 'Source BankAccount UUID' })
  @IsString()
  @IsNotEmpty()
  fromAccountId!: string;

  @ApiProperty({ example: 'bank-acc-2', description: 'Destination BankAccount UUID' })
  @IsString()
  @IsNotEmpty()
  toAccountId!: string;

  @ApiProperty({ example: 5000.0, description: 'Transfer amount' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-11-05' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional({ example: 15.0, default: 0, description: 'Wire transfer fee' })
  @IsNumber()
  @IsOptional()
  fee?: number;

  @ApiPropertyOptional({ example: 'Weekly treasury sweep to payroll escrow' })
  @IsString()
  @IsOptional()
  reference?: string;
}

export class ImportStatementDto {
  @ApiProperty({ example: 'bank-acc-1' })
  @IsString()
  @IsNotEmpty()
  bankAccountId!: string;

  @ApiProperty({ example: '2026-11-01' })
  @IsString()
  @IsNotEmpty()
  statementDate!: string;

  @ApiProperty({ example: 'statement_nov_2026.csv' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiPropertyOptional({ example: 'CSV', default: 'CSV' })
  @IsString()
  @IsOptional()
  fileFormat?: string;

  @ApiPropertyOptional({
    example: [
      { ref: 'STRIPE-PAYOUT-902', amount: 4850.0, type: 'credit' },
      { ref: 'CHK-4029-SUPPLY', amount: 1200.0, type: 'debit' },
    ],
    description: 'Statement transaction rows',
  })
  @IsArray()
  @IsOptional()
  transactions?: Array<{ ref: string; amount: number; type: string }>;
}

export class ReconcileStatementDto {
  @ApiProperty({ example: 'stmt-uuid-1' })
  @IsString()
  @IsNotEmpty()
  statementId!: string;

  @ApiPropertyOptional({ example: 2, default: 2, description: 'Date tolerance in days (+/-)' })
  @IsNumber()
  @IsOptional()
  toleranceDays?: number;
}

export class OpenRegisterShiftDto {
  @ApiProperty({ example: 'reg-uuid-1', description: 'Front-desk cash register ID' })
  @IsString()
  @IsNotEmpty()
  registerId!: string;

  @ApiProperty({ example: 500.0, description: 'Shift opening cash float (Standard $500)' })
  @IsNumber()
  @Min(0)
  openingFloat!: number;
}

export class CloseRegisterShiftDto {
  @ApiProperty({ example: 'shift-uuid-1' })
  @IsString()
  @IsNotEmpty()
  shiftId!: string;

  @ApiProperty({ example: 1420.0, description: 'Final physical cash counted in drawer' })
  @IsNumber()
  @Min(0)
  closingCash!: number;
}
