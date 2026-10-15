import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConfirmEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  code!: string;
}
