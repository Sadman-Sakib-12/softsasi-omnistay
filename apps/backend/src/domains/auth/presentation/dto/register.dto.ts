import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Full name of the registrant', example: 'Alexander Wright' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @ApiProperty({ description: 'Unique email address', example: 'alexander@grandresort.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @ApiProperty({ description: 'Account password (minimum 6 characters)', example: 'Secret123!' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @ApiProperty({ description: 'Hotel / Property or Company name', example: 'Grand Palace Luxury Resort & Spa' })
  @IsString()
  @IsNotEmpty({ message: 'Company or property name is required' })
  companyName!: string;

  @ApiPropertyOptional({ description: 'Primary operational phone number', example: '+8801700000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Type of hospitality property', example: 'hotel' })
  @IsString()
  @IsOptional()
  propertyType?: string;
}

