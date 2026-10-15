import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class Verify2faDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'TOTP code must be exactly 6 digits' })
  code?: string;

  @IsString()
  @IsOptional()
  recoveryCode?: string;
}
