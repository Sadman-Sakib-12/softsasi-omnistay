import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEnrollmentDto {
  @ApiProperty({
    example: '123456',
    description: '6-digit verification code from the configured authenticator app',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  code!: string;
}
