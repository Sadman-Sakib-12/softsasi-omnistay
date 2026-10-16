import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Verify2faDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Temporary challenge JWT received from the initial login response',
  })
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @ApiPropertyOptional({
    example: '123456',
    description: '6-digit time-based one-time password from authenticator app',
  })
  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'TOTP code must be exactly 6 digits' })
  code?: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4e5f6g7h8',
    description: '16-character backup recovery code if authenticator device is inaccessible',
  })
  @IsString()
  @IsOptional()
  recoveryCode?: string;
}
