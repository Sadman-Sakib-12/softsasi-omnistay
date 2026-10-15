import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Disable2faDto {
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'TOTP verification code must be 6 digits' })
  code!: string;
}
