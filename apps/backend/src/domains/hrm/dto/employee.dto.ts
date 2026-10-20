import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Grand Luxury Resort & Villas' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '100 Oceanfront Drive, Miami FL' })
  @IsString()
  @IsOptional()
  address?: string;
}

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsString()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ example: 'Culinary & Kitchen' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateDesignationDto {
  @ApiProperty({ description: 'Department ID' })
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty({ example: 'Executive Sous Chef' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateEmployeeDto {
  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Designation ID' })
  @IsString()
  @IsOptional()
  designationId?: string;

  @ApiProperty({ example: 'EMP-2026-0042' })
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @ApiProperty({ example: 'Alexander Wright' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'alex.wright@omnistay.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: '+1-305-555-0199' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  joiningDate!: string;

  @ApiProperty({ example: 4500.0, description: 'Monthly base contract salary' })
  @IsNumber()
  @Min(0)
  salaryBasic!: number;
}
