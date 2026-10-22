import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RegisterSmartLockDto {
  @ApiProperty({ description: 'Room UUID to install lock on', example: 'a0000000-0000-0000-0000-000000000001' })
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @ApiPropertyOptional({ description: 'Vendor/Manufacturer', example: 'AssaAbloy' })
  @IsString()
  @IsOptional()
  lockVendor?: string;

  @ApiProperty({ description: 'Unique device serial hardware number', example: 'LCK-ASSA-9921' })
  @IsString()
  @IsNotEmpty()
  deviceSerial!: string;
}

export class GenerateSmartLockKeyDto {
  @ApiPropertyOptional({ description: 'Assigned Guest UUID' })
  @IsString()
  @IsOptional()
  guestId?: string;

  @ApiProperty({ description: 'Key type: BLE, NFC, PIN, WEB_BLUETOOTH', example: 'BLE' })
  @IsString()
  @IsNotEmpty()
  keyType!: string;

  @ApiProperty({ description: 'Access validity start timestamp' })
  @IsNotEmpty()
  validFrom!: string;

  @ApiProperty({ description: 'Access validity expiration timestamp' })
  @IsNotEmpty()
  validUntil!: string;
}

export class UnlockDoorRequestDto {
  @ApiProperty({ description: 'Decrypted key token or 6-digit PIN code', example: 'BLE-SEC-872911' })
  @IsString()
  @IsNotEmpty()
  tokenOrPin!: string;

  @ApiPropertyOptional({ description: 'Authentication protocol used: BLE, NFC, PIN, WEB_BLUETOOTH', example: 'BLE' })
  @IsString()
  @IsOptional()
  authMethod?: string;
}

export class ConfigureThermostatDto {
  @ApiProperty({ description: 'Room UUID to install thermostat in' })
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @ApiPropertyOptional({ description: 'Device manufacturer/brand', example: 'Honeywell' })
  @IsString()
  @IsOptional()
  deviceBrand?: string;

  @ApiPropertyOptional({ description: 'Initial target temperature in Celsius', example: 21.5 })
  @IsNumber()
  @Min(16.0)
  @Max(30.0)
  @IsOptional()
  targetTemp?: number;
}

export class UpdateThermostatTemperatureDto {
  @ApiProperty({ description: 'Target temperature in Celsius (16.0 - 30.0 °C)', example: 22.0 })
  @IsNumber()
  @Min(16.0)
  @Max(30.0)
  targetTemp!: number;

  @ApiPropertyOptional({ description: 'Activate energy-saving eco mode', example: false })
  @IsBoolean()
  @IsOptional()
  ecoMode?: boolean;
}

export class LogEnergyConsumptionDto {
  @ApiProperty({ description: 'Kilowatt-hours consumed', example: 14.25 })
  @IsNumber()
  kwhConsumed!: number;

  @ApiPropertyOptional({ description: 'Consumption date ISO string' })
  @IsOptional()
  loggedDate?: string;
}

export class CreateRoomQrOrderItemDto {
  @ApiProperty({ description: 'Item name from dining or minibar menu', example: 'Artisan Club Sandwich' })
  @IsString()
  @IsNotEmpty()
  itemTitle!: string;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ description: 'Unit price', example: 18.5 })
  @IsNumber()
  price!: number;
}

export class CreateRoomQrOrderDto {
  @ApiProperty({ description: 'Room UUID where guest is ordering from' })
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @ApiProperty({ type: [CreateRoomQrOrderItemDto], description: 'List of dishes/amenities ordered' })
  items!: CreateRoomQrOrderItemDto[];
}

export class PassportOcrRequestDto {
  @ApiProperty({ description: 'Passport / ID image photo URL or Base64 data' })
  @IsString()
  @IsNotEmpty()
  documentUrl!: string;
}

export class ContactlessSelfCheckInDto {
  @ApiProperty({ description: 'Booking UUID' })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiProperty({ description: 'Guest full legal name as per Passport/ID' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ description: 'Passport or National ID number' })
  @IsString()
  @IsNotEmpty()
  idNumber!: string;

  @ApiProperty({ description: 'Digital signature data string' })
  @IsString()
  @IsNotEmpty()
  digitalSignature!: string;
}
