import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVendorPlanDto {
  @ApiProperty({ example: 'Premier Host Tier' })
  @IsString()
  @IsNotEmpty()
  planName!: string;

  @ApiPropertyOptional({ example: 50, description: 'Max simultaneous listings' })
  @IsNumber()
  @IsOptional()
  maxListings?: number;

  @ApiPropertyOptional({ example: 12.0, description: 'Platform fee percentage' })
  @IsNumber()
  @IsOptional()
  feePercent?: number;

  @ApiPropertyOptional({ example: 99.0, description: 'Monthly subscription fee' })
  @IsNumber()
  @IsOptional()
  monthlyFee?: number;
}

export class RegisterVendorDto {
  @ApiProperty({ example: 'Azure Luxury Yacht Charters & Stays' })
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @ApiPropertyOptional({ example: 'TAX-US-987654321' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ example: 15.0, description: 'Default commission percentage' })
  @IsNumber()
  @IsOptional()
  commissionRate?: number;
}

export class SubmitKycDto {
  @ApiProperty({ example: 'hospitality_license', enum: ['passport', 'national_id', 'hospitality_license', 'property_deed'] })
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @ApiProperty({ example: 'https://storage.omnistay.com/kyc/license-101.pdf' })
  @IsString()
  @IsNotEmpty()
  documentUrl!: string;
}

export class AddVendorTeamMemberDto {
  @ApiProperty({ description: 'User UUID of team member' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'manager', enum: ['manager', 'frontdesk', 'cleaner'] })
  @IsString()
  @IsNotEmpty()
  role!: string;
}
