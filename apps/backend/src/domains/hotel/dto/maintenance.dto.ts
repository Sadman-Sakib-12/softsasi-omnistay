import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaintenanceWorkOrderDto {
  @ApiProperty({
    example: 'uuid-property-id',
    description: 'Property UUID where the maintenance defect is located',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId!: string;

  @ApiPropertyOptional({
    example: 'uuid-room-id',
    description: 'Specific physical room unit affected (if applicable)',
  })
  @IsUUID()
  @IsOptional()
  roomId?: string;

  @ApiProperty({
    example: 'Room 304 HVAC cooling compressor failure',
    description: 'Concise summary of the engineering work order ticket',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Guest reported ambient temperature locked at 28C. Thermostat relay unresponsive.',
    description: 'Detailed description of the defect and inspection notes',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    example: 'routine',
    description: 'Severity priority: emergency, high, routine',
    default: 'routine',
  })
  @IsString()
  @IsOptional()
  @IsIn(['emergency', 'high', 'routine'])
  priority?: string;

  @ApiPropertyOptional({
    example: 4,
    description: 'SLA resolution deadline in hours',
    default: 24,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(720)
  slaHours?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Automatically mark room operational status to OOO (Out of Order) to prevent bookings',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  blockRoomOutOfOrder?: boolean;

  @ApiPropertyOptional({
    example: 'uuid-technician-id',
    description: 'User UUID of the assigned maintenance engineer',
  })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}

export class UpdateMaintenanceWorkOrderStatusDto {
  @ApiProperty({
    example: 'resolved',
    description: 'Updated state: open, in_progress, resolved, closed',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['open', 'in_progress', 'resolved', 'closed'])
  status!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Automatically unblock room back to "available" if ticket is resolved/closed',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  restoreRoomAvailable?: boolean;

  @ApiPropertyOptional({
    example: 'Replaced HVAC capacitor and purged refrigerant lines. AC cooling tested at 20C.',
    description: 'Resolution remarks and technician completion log',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
