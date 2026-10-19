import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    example: '101',
    description: 'Physical room number or code (e.g. 101, 102, Villa 4)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  roomNumber!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Floor level of the physical room',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({
    example: 'Building A',
    description: 'Building or wing name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  building?: string;

  @ApiPropertyOptional({
    example: 'clean',
    description: 'Initial cleanliness status (clean, dirty, inspected, cleaning)',
    default: 'clean',
  })
  @IsString()
  @IsOptional()
  @IsIn(['clean', 'dirty', 'inspected', 'cleaning'])
  cleanlinessStatus?: string;

  @ApiPropertyOptional({
    example: 'available',
    description: 'Initial operational status (available, ooo, oos)',
    default: 'available',
  })
  @IsString()
  @IsOptional()
  @IsIn(['available', 'ooo', 'oos'])
  operationalStatus?: string;

  @ApiPropertyOptional({
    example: 'KEY-CARD-RFID-9942',
    description: 'Electronic door lock / RFID / BLE identifier',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  keycardCode?: string;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({
    example: '101-A',
    description: 'Updated room number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  roomNumber?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Updated floor level',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({
    example: 'West Wing',
    description: 'Updated building name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  building?: string;

  @ApiPropertyOptional({
    example: 'KEY-CARD-RFID-1001',
    description: 'Updated keycard code',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  keycardCode?: string;

  @ApiPropertyOptional({
    example: 'uuid-room-type-id',
    description: 'Reassign room to another room category',
  })
  @IsUUID()
  @IsOptional()
  roomTypeId?: string;
}

export class UpdateRoomStatusDto {
  @ApiPropertyOptional({
    example: 'clean',
    description: 'Room cleanliness status: clean, dirty, inspected, cleaning',
  })
  @IsString()
  @IsOptional()
  @IsIn(['clean', 'dirty', 'inspected', 'cleaning'])
  cleanlinessStatus?: string;

  @ApiPropertyOptional({
    example: 'available',
    description: 'Room operational status: available, ooo (Out of Order), oos (Out of Service)',
  })
  @IsString()
  @IsOptional()
  @IsIn(['available', 'ooo', 'oos'])
  operationalStatus?: string;

  @ApiPropertyOptional({
    example: 'Room inspected and approved after deep clean by housekeeping supervisor',
    description: 'Operational notes logged into audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
