import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import { KdsApplicationService } from '../../application/services/kds.application-service.js';
import { CreateKdsStationDto, UpdateKdsOrderStatusDto } from '../dto/kds.dto.js';

@ApiTags('POS - Kitchen Display System (KDS)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/pos/kds')
export class KdsController {
  constructor(private readonly kdsService: KdsApplicationService) {}

  @Post(':outletId/stations')
  @Roles('SuperAdmin', 'Company Owner/GM', 'Property General Manager', 'F&B Director', 'Executive Chef')
  @ApiOperation({ summary: 'Create kitchen display station (grill, salad, bar, expo)' })
  createStation(
    @Param('outletId') outletId: string,
    @Body() dto: CreateKdsStationDto,
  ) {
    return this.kdsService.createStation(outletId, dto);
  }

  @Get(':outletId/stations')
  @ApiOperation({ summary: 'Get all kitchen stations for an outlet with active orders' })
  getStationsByOutlet(@Param('outletId') outletId: string) {
    return this.kdsService.getStationsByOutlet(outletId);
  }

  @Get(':outletId/queue')
  @ApiOperation({ summary: 'Get live active kitchen queue with prep timers & >15 min delay alerts' })
  getActiveKitchenQueue(@Param('outletId') outletId: string) {
    return this.kdsService.getActiveKitchenQueue(outletId);
  }

  @Patch('tickets/:ticketId/status')
  @ApiOperation({ summary: 'Transition ticket state (queued -> cooking -> ready -> served)' })
  updateKitchenOrderStatus(
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateKdsOrderStatusDto,
  ) {
    return this.kdsService.updateKitchenOrderStatus(ticketId, dto);
  }
}
