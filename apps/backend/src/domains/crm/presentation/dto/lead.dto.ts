import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeadStageDto {
  @ApiProperty({ example: 'Discovery / Inquiry' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreateLeadDto {
  @ApiPropertyOptional({ description: 'Stage UUID' })
  @IsString()
  @IsOptional()
  stageId?: string;

  @ApiProperty({ example: 'Grand Wedding Inquiry - 250 Pax' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Catherine Vanderbilt' })
  @IsString()
  @IsNotEmpty()
  contactName!: string;

  @ApiPropertyOptional({ example: 'catherine@vanderbilt.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1-212-555-0199' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'wedding_banquet' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ example: 250, description: 'Guest headcount' })
  @IsNumber()
  @IsOptional()
  guestCount?: number;

  @ApiPropertyOptional({ example: 45000, description: 'Estimated budget USD' })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ example: 3, description: 'Event duration in days' })
  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Assign to Sales Manager UUID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class AddLeadCallLogDto {
  @ApiProperty({ example: 'Banquet Menu Discussion & Timeline' })
  @IsString()
  @IsNotEmpty()
  callSubject!: string;

  @ApiPropertyOptional({ example: 15, description: 'Duration in minutes' })
  @IsNumber()
  @IsOptional()
  callDuration?: number;

  @ApiPropertyOptional({ example: 'Client requested French-Mediterranean 4-course menu.' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AddLeadNoteDto {
  @ApiProperty({ example: 'Client scheduled VIP on-site inspection for next Saturday.' })
  @IsString()
  @IsNotEmpty()
  noteContent!: string;
}
