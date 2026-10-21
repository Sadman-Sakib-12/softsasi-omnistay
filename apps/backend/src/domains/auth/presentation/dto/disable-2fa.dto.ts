import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Disable2faDto {
  @ApiProperty({
    example: 'AccountPassword123!',
    description: 'Current user password to confirm identity',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    example: '123456',
    description: 'Current 6-digit TOTP verification code',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'TOTP verification code must be 6 digits' })
  code!: string;
}
