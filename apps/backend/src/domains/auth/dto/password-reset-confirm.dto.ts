import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetConfirmDto {
  @ApiProperty({
    example: 'd9b33a5951833bdc60b57e7935de98379f8263539bc27a94ef93f2f84b3d8816',
    description: 'Cryptographically random password reset token received via email',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'Str0ngP@ssw0rd!2026',
    description: 'New password meeting complexity policy (min 8 chars, uppercase, lowercase, numbers, symbols)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, numbers, and symbols',
  })
  newPassword!: string;
}
