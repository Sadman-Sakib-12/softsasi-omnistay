import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DimensionRatingDto {
  @ApiProperty({ example: 'Cleanliness', enum: ['Cleanliness', 'Location', 'Service', 'Amenities', 'Value for Money'] })
  @IsString()
  @IsNotEmpty()
  dimension!: string;

  @ApiProperty({ example: 5, description: 'Score between 1 and 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  score!: number;
}

export class CreateGuestReviewDto {
  @ApiProperty({ description: 'Confirmed Booking UUID' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiPropertyOptional({ example: 'Stunning property with panoramic ocean views and world-class staff.' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ type: [DimensionRatingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DimensionRatingDto)
  ratings!: DimensionRatingDto[];
}

export class ReplyReviewDto {
  @ApiProperty({ example: 'Thank you for your generous review! It was our pleasure hosting your stay.' })
  @IsString()
  @IsNotEmpty()
  replyText!: string;
}
