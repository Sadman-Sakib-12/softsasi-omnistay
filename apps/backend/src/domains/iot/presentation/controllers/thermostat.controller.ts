import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { ThermostatService } from '../../application/services/thermostat.service.js';
import { ConfigureThermostatDto, LogEnergyConsumptionDto, UpdateThermostatTemperatureDto } from '../dto/iot.dto.js';

@ApiTags('IoT - Smart Thermostats & HVAC Energy Management')
@Controller('api/v1/iot/thermostats')
export class ThermostatController {
  constructor(private readonly thermostatService: ThermostatService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register and pair room smart thermostat device (Honeywell/Nest/Schneider)' })
  configureThermostat(@Body() dto: ConfigureThermostatDto) {
    return this.thermostatService.configureThermostat(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all property thermostats and climate statuses' })
  listThermostats() {
    return this.thermostatService.listThermostats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get thermostat climate metrics and energy consumption history' })
  getThermostat(@Param('id') id: string) {
    return this.thermostatService.getThermostat(id);
  }

  @Patch(':id/temperature')
  @ApiOperation({ summary: 'Adjust room target temperature and toggle Eco Mode' })
  updateTemperature(@Param('id') id: string, @Body() dto: UpdateThermostatTemperatureDto) {
    return this.thermostatService.updateTemperature(id, dto);
  }

  @Post(':id/energy-logs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Log daily kilowatt-hour (kWh) power consumption for energy optimization' })
  logEnergy(@Param('id') id: string, @Body() dto: LogEnergyConsumptionDto) {
    return this.thermostatService.logEnergy(id, dto);
  }

  @Get(':id/energy-logs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve power consumption logs for room sustainability reports' })
  getEnergyLogs(@Param('id') id: string) {
    return this.thermostatService.getEnergyLogs(id);
  }
}
