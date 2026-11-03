import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Target user email address', example: 'owner@resort.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: '6-digit numeric activation code', example: '849201' })
  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  code?: string;

  @ApiPropertyOptional({ description: 'Cryptographic activation token from URL', example: 'd3f78a2e...' })
  @IsString()
  @IsOptional()
  token?: string;
}

export class ResendVerificationDto {
  @ApiProperty({ description: 'Target user email address to resend activation link/code', example: 'owner@resort.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty()
  email!: string;
}
