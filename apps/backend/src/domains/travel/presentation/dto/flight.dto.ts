import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAirlineDto {
  @ApiProperty({ example: 'OmniAir Charter', description: 'Airline name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'OA', description: '2-character IATA code' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(3)
  iataCode!: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateAirportDto {
  @ApiProperty({ example: 'MIA', description: '3-letter IATA airport code' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(4)
  iataCode!: string;

  @ApiProperty({ example: 'Miami International Airport' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Miami' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  country!: string;
}

export class CreateFlightDto {
  @ApiProperty({ example: 'OA-402', description: 'Flight number' })
  @IsString()
  @IsNotEmpty()
  flightNumber!: string;

  @ApiProperty({ example: 'air-uuid-1', description: 'Airline UUID' })
  @IsString()
  @IsNotEmpty()
  airlineId!: string;

  @ApiProperty({ example: 'apt-uuid-orig', description: 'Origin airport UUID' })
  @IsString()
  @IsNotEmpty()
  originAirportId!: string;

  @ApiProperty({ example: 'apt-uuid-dest', description: 'Destination airport UUID' })
  @IsString()
  @IsNotEmpty()
  destAirportId!: string;

  @ApiProperty({ example: '2026-11-12T14:30:00Z', description: 'Departure time' })
  @IsString()
  @IsNotEmpty()
  departureTime!: string;

  @ApiProperty({ example: '2026-11-12T17:45:00Z', description: 'Arrival time' })
  @IsString()
  @IsNotEmpty()
  arrivalTime!: string;

  @ApiProperty({ example: 'Cessna Caravan 208B Seaplane', description: 'Aircraft type' })
  @IsString()
  @IsNotEmpty()
  aircraftType!: string;

  @ApiProperty({ example: 420.0, description: 'Base seat price' })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ example: 'scheduled', default: 'scheduled' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: [
      { seatNumber: '1A', cabinClass: 'First', price: 600 },
      { seatNumber: '2A', cabinClass: 'Economy', price: 420 },
    ],
  })
  @IsArray()
  @IsOptional()
  seats?: Array<{ seatNumber: string; cabinClass?: string; price: number }>;
}

export class PassengerDto {
  @ApiProperty({ example: 'A12345678', description: 'Legal passport number' })
  @IsString()
  @IsNotEmpty()
  passportNo!: string;

  @ApiProperty({ example: 'Sadman Sakib', description: 'Full legal name' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'Bangladeshi', description: 'Nationality' })
  @IsString()
  @IsNotEmpty()
  nationality!: string;

  @ApiProperty({ example: '1998-05-14', description: 'Date of birth' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth!: string;

  @ApiPropertyOptional({ example: '1A' })
  @IsString()
  @IsOptional()
  seatNumber?: string;
}

export class BookFlightDto {
  @ApiProperty({ example: 'flt-uuid-1', description: 'Flight UUID' })
  @IsString()
  @IsNotEmpty()
  flightId!: string;

  @ApiProperty({ type: [PassengerDto], description: 'Passenger manifest list (APIS/TSA compliant)' })
  @IsArray()
  @IsNotEmpty()
  passengers!: PassengerDto[];
}
