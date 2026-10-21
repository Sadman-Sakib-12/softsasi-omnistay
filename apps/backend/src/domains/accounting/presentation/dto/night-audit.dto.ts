import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunNightAuditDto {
  @ApiProperty({ example: '2026-11-01', description: 'Business audit date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  auditDate!: string;

  @ApiPropertyOptional({ example: false, default: false, description: 'Force re-run even if already completed' })
  @IsBoolean()
  @IsOptional()
  forceRun?: boolean;
}
