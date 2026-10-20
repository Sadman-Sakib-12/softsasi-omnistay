import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeaveApplicationDto {
  @ApiProperty({ description: 'Employee UUID' })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ description: 'Leave Type UUID' })
  @IsString()
  @IsNotEmpty()
  leaveTypeId!: string;

  @ApiProperty({ example: '2026-11-10' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-11-14' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 'Annual family holiday vacation' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ReviewLeaveApplicationDto {
  @ApiProperty({ enum: ['head_approved', 'hr_approved', 'rejected'], example: 'head_approved' })
  @IsEnum(['head_approved', 'hr_approved', 'rejected'])
  decision!: string;

  @ApiPropertyOptional({ description: 'Optional feedback or rejection reason' })
  @IsString()
  @IsOptional()
  comments?: string;
}
