import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SetSalaryDto {
  @ApiProperty({ description: 'Employee UUID' })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ example: 4500.0, description: 'Basic monthly salary' })
  @IsNumber()
  @Min(0)
  basicSalary!: number;

  @ApiPropertyOptional({ example: 'monthly', default: 'monthly' })
  @IsString()
  @IsOptional()
  payslipType?: string;
}

export class CreateServiceChargePoolDto {
  @ApiProperty({ example: '2026-10', description: 'Payroll month format YYYY-MM' })
  @IsString()
  @IsNotEmpty()
  month!: string;

  @ApiProperty({ example: 45000.0, description: 'Total 10% guest service charge collected across all F&B & PMS' })
  @IsNumber()
  @Min(0)
  totalPool!: number;

  @ApiProperty({ example: 90, description: 'Count of eligible frontline staff members' })
  @IsInt()
  @Min(1)
  paxStaff!: number;
}

export class RunMonthlyPayrollDto {
  @ApiProperty({ example: '2026-10', description: 'Month in YYYY-MM format' })
  @IsString()
  @IsNotEmpty()
  salaryMonth!: string;
}
