import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetItemInputDto {
  @ApiProperty({ description: 'Account Code, e.g. 5010, 6010, 6100', example: '5010' })
  @IsString()
  accountCode: string;

  @ApiProperty({ description: 'Month index (1 to 12)', example: 10 })
  @IsNumber()
  month: number;

  @ApiProperty({ description: 'Allocated monthly expenditure cap in USD', example: 40000 })
  @IsNumber()
  allocated: number;
}

export class CreateDepartmentBudgetDto {
  @ApiProperty({ description: 'Department Name, e.g. Food & Beverage, Housekeeping, Sales & Marketing, Maintenance', example: 'Food & Beverage' })
  @IsString()
  departmentName: string;

  @ApiProperty({ description: 'Fiscal Year, e.g. 2026', example: '2026' })
  @IsString()
  fiscalYear: string;

  @ApiProperty({ description: 'Total annual expenditure cap in USD', example: 480000 })
  @IsNumber()
  totalBudget: number;

  @ApiPropertyOptional({ type: [BudgetItemInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemInputDto)
  items?: BudgetItemInputDto[];
}

export class UpdateDepartmentBudgetDto {
  @ApiPropertyOptional({ description: 'Total annual expenditure cap in USD' })
  @IsOptional()
  @IsNumber()
  totalBudget?: number;

  @ApiPropertyOptional({ description: 'Department Name' })
  @IsOptional()
  @IsString()
  departmentName?: string;
}
