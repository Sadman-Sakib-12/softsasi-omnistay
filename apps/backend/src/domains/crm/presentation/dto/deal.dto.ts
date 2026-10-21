import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDealStageDto {
  @ApiProperty({ example: 'Proposal & Banquet Menu Sent' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreateDealDto {
  @ApiPropertyOptional({ description: 'Deal Stage UUID' })
  @IsString()
  @IsOptional()
  stageId?: string;

  @ApiProperty({ example: 'Global Tech Leadership Summit 2026' })
  @IsString()
  @IsNotEmpty()
  dealName!: string;

  @ApiProperty({ example: 85000.0, description: 'Total deal value in USD' })
  @IsNumber()
  @Min(0)
  dealValue!: number;

  @ApiPropertyOptional({ example: '2026-11-20' })
  @IsDateString()
  @IsOptional()
  expectedClose?: string;

  @ApiPropertyOptional({ example: 'open', enum: ['open', 'won', 'lost'] })
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateDealProposalDto {
  @ApiProperty({ example: 'PROP-2026-TECH-01' })
  @IsString()
  @IsNotEmpty()
  proposalRef!: string;

  @ApiProperty({ example: 85000.0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 'https://storage.omnistay.com/proposals/prop-tech-01.pdf' })
  @IsString()
  @IsOptional()
  pdfUrl?: string;
}

export class CreateBanquetContractDto {
  @ApiProperty({ example: 'CTR-BANQ-2026-088' })
  @IsString()
  @IsNotEmpty()
  contractNumber!: string;

  @ApiProperty({ example: 'Standard Master Hospitality Event Terms: 50% non-refundable deposit upon signing...' })
  @IsString()
  @IsNotEmpty()
  termsContent!: string;
}

export class SignContractDto {
  @ApiProperty({ example: 'Eleanor Roosevelt' })
  @IsString()
  @IsNotEmpty()
  signerName!: string;

  @ApiProperty({ example: '192.168.1.100' })
  @IsString()
  @IsNotEmpty()
  signerIp!: string;

  @ApiProperty({ example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' })
  @IsString()
  @IsNotEmpty()
  signatureImg!: string;
}
