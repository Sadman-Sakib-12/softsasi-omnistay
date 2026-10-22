import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { SmartLockService } from '../../application/services/smart-lock.service.js';
import { GenerateSmartLockKeyDto, RegisterSmartLockDto, UnlockDoorRequestDto } from '../dto/iot.dto.js';

@ApiTags('IoT - Smart Room Locks & BLE Access')
@Controller('api/v1/iot/locks')
export class SmartLockController {
  constructor(private readonly lockService: SmartLockService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a new smart door lock hardware terminal' })
  registerLock(@Body() dto: RegisterSmartLockDto) {
    return this.lockService.registerLock(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all property smart door locks and live status' })
  listLocks() {
    return this.lockService.listLocks();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get smart door lock device details and recent access logs' })
  getLock(@Param('id') id: string) {
    return this.lockService.getLock(id);
  }

  @Post(':id/keys')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate encrypted BLE token or 6-digit PIN code for guest access' })
  generateKey(@Param('id') id: string, @Body() dto: GenerateSmartLockKeyDto) {
    return this.lockService.generateKey(id, dto);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Execute instant BLE / PIN handshake to unlock hotel room door (<400ms)' })
  unlockDoor(@Param('id') id: string, @Body() dto: UnlockDoorRequestDto) {
    return this.lockService.unlock(id, dto);
  }

  @Get(':id/access-logs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Audit trail of access attempts (granted/denied) for room door lock' })
  getAccessLogs(@Param('id') id: string) {
    return this.lockService.getAccessLogs(id);
  }
}
