import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BiometricHardwarePunchDto {
  @ApiProperty({ description: 'Biometric Terminal Device Serial / ID', example: 'ZK-BIO-TERMINAL-01' })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @ApiProperty({ example: 'EMP-2026-0042' })
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @ApiProperty({ example: '2026-10-20T07:02:15Z' })
  @IsDateString()
  punchTime!: string;

  @ApiProperty({ enum: ['clock_in', 'clock_out'], example: 'clock_in' })
  @IsEnum(['clock_in', 'clock_out'])
  punchType!: string;
}

export class MobileGeofenceClockInDto {
  @ApiProperty({ example: 'EMP-2026-0042' })
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @ApiProperty({ example: 25.7617, description: 'Latitude coordinate from device GPS' })
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: -80.1918, description: 'Longitude coordinate from device GPS' })
  @IsNumber()
  longitude!: number;

  @ApiProperty({ enum: ['clock_in', 'clock_out'], example: 'clock_in' })
  @IsEnum(['clock_in', 'clock_out'])
  punchType!: string;
}

export class CreateShiftScheduleDto {
  @ApiProperty({ example: 'Morning Shift (Culinary & Front Desk)' })
  @IsString()
  @IsNotEmpty()
  shiftName!: string;

  @ApiProperty({ example: '07:00' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ example: '15:30' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @ApiPropertyOptional({ default: false, description: 'True for night audit graveyard shift' })
  @IsBoolean()
  @IsOptional()
  isOvernight?: boolean;
}
