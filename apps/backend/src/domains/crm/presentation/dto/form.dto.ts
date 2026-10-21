import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateFormBuilderDto {
  @ApiProperty({ example: 'Boutique Wedding & Banquet Inquiry' })
  @IsString()
  @IsNotEmpty()
  formName!: string;

  @ApiProperty({
    example: {
      fields: [
        { name: 'fullName', type: 'text', label: 'Full Name', required: true },
        { name: 'email', type: 'email', label: 'Work Email', required: true },
        { name: 'budget', type: 'number', label: 'Target Budget USD', required: false },
        { name: 'headcount', type: 'number', label: 'Expected Guests', required: true },
      ],
    },
  })
  @IsObject()
  formSchema!: Record<string, any>;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SubmitFormResponseDto {
  @ApiProperty({
    example: {
      fullName: 'Sophia Martinez',
      email: 'sophia@luxevents.com',
      budget: 60000,
      headcount: 200,
    },
  })
  @IsObject()
  formData!: Record<string, any>;

  @ApiPropertyOptional({ example: '127.0.0.1' })
  @IsString()
  @IsOptional()
  submitterIp?: string;
}
