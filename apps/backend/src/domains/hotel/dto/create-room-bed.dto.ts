import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomBedDto {
  @ApiProperty({
    example: 'king',
    description: 'Bed type classification (king, queen, twin, double, sofa_bed, baby_cot)',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['king', 'queen', 'twin', 'double', 'sofa_bed', 'baby_cot'])
  bedType!: string;

  @ApiProperty({
    example: 1,
    description: 'Quantity of this bed type in the room category',
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  quantity!: number;
}
