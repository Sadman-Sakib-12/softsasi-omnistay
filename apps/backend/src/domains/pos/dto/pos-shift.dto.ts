import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashierShiftDto {
  @ApiProperty({ description: 'POS Terminal UUID' })
  @IsString()
  @IsNotEmpty()
  terminalId!: string;

  @ApiProperty({ example: 'Emily Watson' })
  @IsString()
  @IsNotEmpty()
  cashierName!: string;

  @ApiProperty({ example: 500.0, description: 'Opening cash float amount (standard $500 float)' })
  @IsNumber()
  @Min(0)
  openingFloat!: number;
}

export class RecordCashDropDto {
  @ApiProperty({ example: 450.0, description: 'Amount dropped to safe' })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ example: 'Safe drop: drawer cash exceeded limit', default: 'safe_drop' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CloseCashierShiftDto {
  @ApiProperty({ example: 512.5, description: 'Physical cash counted in drawer at shift end' })
  @IsNumber()
  @Min(0)
  physicalCashCounted!: number;

  @ApiPropertyOptional({ description: 'Optional cashier remarks' })
  @IsString()
  @IsOptional()
  notes?: string;
}
