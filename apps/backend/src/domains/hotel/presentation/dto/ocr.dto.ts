import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ParsePassportDto {
  @ApiPropertyOptional({
    example: 'data:image/jpeg;base64,...',
    description: 'Base64 image string of passport or national ID',
  })
  @IsString()
  @IsOptional()
  imageBase64?: string;

  @ApiPropertyOptional({
    example: 'P<USADOE<<JOHN<<<<<<<<<<<<<<<<<<<\n1234567890USA8001014M2501011<<<<<<<',
    description: 'Raw OCR extracted text',
  })
  @IsString()
  @IsOptional()
  rawText?: string;

  @ApiPropertyOptional({
    example: ['P<USADOE<<JOHN<<<<<<<<<<<<<<<<<<<', '1234567890USA8001014M2501011<<<<<<<'],
    description: 'Machine-Readable Zone lines',
  })
  @IsArray()
  @IsOptional()
  mrzLines?: string[];
}

