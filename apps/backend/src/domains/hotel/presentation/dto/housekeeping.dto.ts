import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHousekeepingTaskDto {
  @ApiProperty({
    example: 'uuid-room-id',
    description: 'Target physical room unit UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  roomId!: string;

  @ApiPropertyOptional({
    example: 'uuid-housekeeper-user-id',
    description: 'Assigned housekeeper staff user UUID',
  })
  @IsUUID()
  @IsOptional()
  housekeeperId?: string;

  @ApiProperty({
    example: 'checkout_clean',
    description: 'Type of cleaning task: checkout_clean, stayover_clean, deep_clean, inspection',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['checkout_clean', 'stayover_clean', 'deep_clean', 'inspection'])
  taskType!: string;

  @ApiPropertyOptional({
    example: 'normal',
    description: 'Task priority: high, normal',
    default: 'normal',
  })
  @IsString()
  @IsOptional()
  @IsIn(['high', 'normal'])
  priority?: string;
}

export class UpdateHousekeepingTaskStatusDto {
  @ApiProperty({
    example: 'completed',
    description: 'Updated task state: assigned, in_progress, completed, verified',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['assigned', 'in_progress', 'completed', 'verified'])
  status!: string;

  @ApiPropertyOptional({
    example: 'Deep sanitization complete, fresh Egyptian cotton linens replaced, mini-bar restocked.',
    description: 'Completion remarks from housekeeper or supervisor',
  })
  @IsString()
  @IsOptional()
  completionNotes?: string;
}
