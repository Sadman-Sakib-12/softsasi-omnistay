import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKdsStationDto {
  @ApiProperty({ example: 'Main Kitchen Grill Station' })
  @IsString()
  @IsNotEmpty()
  stationName!: string;

  @ApiProperty({ enum: ['kitchen', 'grill', 'salad', 'bar', 'dessert', 'expo'], default: 'kitchen' })
  @IsEnum(['kitchen', 'grill', 'salad', 'bar', 'dessert', 'expo'])
  stationType!: string;
}

export class UpdateKdsOrderStatusDto {
  @ApiProperty({ enum: ['queued', 'cooking', 'ready', 'served', 'cancelled'], example: 'ready' })
  @IsEnum(['queued', 'cooking', 'ready', 'served', 'cancelled'])
  status!: string;

  @ApiPropertyOptional({ description: 'Optional chef or expeditor notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
