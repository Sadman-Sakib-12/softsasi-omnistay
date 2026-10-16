import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'a7b8c9d0e1f2...',
    description: 'Cryptographically signed refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
