import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoomQrService } from '../../application/services/room-qr.service.js';
import { CreateRoomQrOrderDto } from '../dto/iot.dto.js';

@ApiTags('IoT - In-Room Contactless QR Dining')
@Controller('api/v1/iot/room-qr')
export class RoomQrController {
  constructor(private readonly roomQrService: RoomQrService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Submit instant contactless in-room dining / minibar order via QR code' })
  createOrder(@Body() dto: CreateRoomQrOrderDto) {
    return this.roomQrService.createQrOrder(dto);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Track real-time in-room dining order status and estimated delivery time' })
  getOrder(@Param('id') id: string) {
    return this.roomQrService.getOrder(id);
  }

  @Get('rooms/:roomId/orders')
  @ApiOperation({ summary: 'List all in-room orders placed for specific room' })
  getOrdersByRoom(@Param('roomId') roomId: string) {
    return this.roomQrService.getOrdersByRoom(roomId);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update in-room dining order status (preparing, delivering, delivered)' })
  updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.roomQrService.updateOrderStatus(id, status);
  }
}
