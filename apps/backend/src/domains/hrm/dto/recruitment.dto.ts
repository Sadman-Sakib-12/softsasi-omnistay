import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateJobPostDto {
  @ApiProperty({ example: 'Head Sommelier & Wine Director' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Food & Beverage' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ example: 2, default: 1 })
  @IsInt()
  @Min(1)
  positionsCount!: number;

  @ApiProperty({ example: 'Oversees luxury resort wine cellar, pairings, and sommelier training.' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class SubmitJobApplicationDto {
  @ApiProperty({ description: 'Job UUID' })
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @ApiProperty({ example: 'Jean-Luc Picard' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'jeanluc@winery.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: '+1-555-0144' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.omnistay.com/resumes/sommelier-jl.pdf' })
  @IsString()
  @IsOptional()
  resumeUrl?: string;
}

export class UpdateApplicationStageDto {
  @ApiProperty({
    enum: ['applied', 'screening', 'skills_test', 'interview', 'offer', 'onboarded', 'rejected'],
    example: 'interview',
  })
  @IsEnum(['applied', 'screening', 'skills_test', 'interview', 'offer', 'onboarded', 'rejected'])
  stage!: string;
}

export class ScheduleInterviewDto {
  @ApiProperty({ description: 'Job Application UUID' })
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @ApiProperty({ example: '2026-11-02T14:00:00Z' })
  @IsDateString()
  scheduledDate!: string;

  @ApiPropertyOptional({ enum: ['in_person', 'zoom_video'], default: 'zoom_video' })
  @IsEnum(['in_person', 'zoom_video'])
  @IsOptional()
  roundType?: string;
}

export class SubmitAppraisalDto {
  @ApiProperty({ description: 'Employee UUID' })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ example: 4.8, description: 'Rating score from 1.0 to 5.0' })
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  ratingScore!: number;

  @ApiProperty({ example: 'Q3 2026' })
  @IsString()
  @IsNotEmpty()
  reviewPeriod!: string;

  @ApiPropertyOptional({ example: 'Exceptional wine pairing upsell numbers and stellar guest satisfaction scores.' })
  @IsString()
  @IsOptional()
  feedback?: string;
}
