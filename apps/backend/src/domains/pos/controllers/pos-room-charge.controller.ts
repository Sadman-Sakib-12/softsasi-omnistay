import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import { PosRoomChargeService } from '../services/pos-room-charge.service.js';
import { ChargeToRoomDto } from '../dto/room-charge.dto.js';

@ApiTags('POS - Room Charge & Guest Folio Integration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/pos/room-charge')
export class PosRoomChargeController {
  constructor(private readonly roomChargeService: PosRoomChargeService) {}

  @Get('verify/:propertyId/:roomNumber')
  @ApiOperation({ summary: 'Two-way check: verify room occupancy, guest name, and credit limit' })
  verifyRoomForCharge(
    @Param('propertyId') propertyId: string,
    @Param('roomNumber') roomNumber: string,
  ) {
    return this.roomChargeService.verifyRoomForCharge(propertyId, roomNumber);
  }

  @Post('charge')
  @ApiOperation({ summary: 'Charge dining bill directly to guest room folio with digital signature' })
  chargeToRoom(@Body() dto: ChargeToRoomDto) {
    return this.roomChargeService.chargeToRoom(dto);
  }
}
