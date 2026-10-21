import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateGuestProfile360Dto {
  @ApiPropertyOptional({ example: 'Gold', enum: ['Silver', 'Gold', 'Platinum', 'VIP Black'] })
  @IsString()
  @IsOptional()
  vipTier?: string;

  @ApiPropertyOptional({ example: 'Prefers high floor, sparkling water on arrival, hypoallergenic pillows' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AddStayPreferenceDto {
  @ApiProperty({ example: 'room_floor' })
  @IsString()
  @IsNotEmpty()
  preferenceKey!: string;

  @ApiProperty({ example: 'High Floor (Above 10)' })
  @IsString()
  @IsNotEmpty()
  preferenceVal!: string;
}

export class AddDietaryRestrictionDto {
  @ApiProperty({ example: 'Celiac / Strict Gluten-Free' })
  @IsString()
  @IsNotEmpty()
  restriction!: string;

  @ApiPropertyOptional({ example: 'Severe allergy: cross-contamination strictly prohibited in kitchen' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SubmitPostStaySurveyDto {
  @ApiProperty({ description: 'Booking UUID' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({ example: 5, description: 'Rating 1 to 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingScore!: number;

  @ApiPropertyOptional({ example: 'Exceptional stay. The butler service and tape chart check-in were seamless.' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({
    example: [
      { question: 'Cleanliness', answerText: '5 - Spotless' },
      { question: 'Staff Courtesy', answerText: '5 - Exemplary' },
    ],
  })
  @IsOptional()
  answers?: Array<{ question: string; answerText: string }>;
}
