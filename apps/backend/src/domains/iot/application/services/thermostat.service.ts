import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IIotRepository } from '../../domain/repositories/iot.repository.interface.js';
import { IOT_REPOSITORY_TOKEN } from '../../domain/repositories/iot.repository.interface.js';
import { ConfigureThermostatDto, LogEnergyConsumptionDto, UpdateThermostatTemperatureDto } from '../../presentation/dto/iot.dto.js';

@Injectable()
export class ThermostatService {
  constructor(
    @Inject(IOT_REPOSITORY_TOKEN)
    private readonly repo: IIotRepository,
  ) {}

  async configureThermostat(dto: ConfigureThermostatDto) {
    return this.repo.createThermostat({
      roomId: dto.roomId,
      deviceBrand: dto.deviceBrand || 'Honeywell',
      targetTemp: dto.targetTemp ?? 21.0,
      currentTemp: dto.targetTemp ?? 21.0,
      ecoMode: false,
    });
  }

  async listThermostats() {
    return this.repo.listThermostats();
  }

  async getThermostat(id: string) {
    const thermostat = await this.repo.findThermostatById(id);
    if (!thermostat) throw new NotFoundException('Thermostat device not found');
    return thermostat;
  }

  async updateTemperature(id: string, dto: UpdateThermostatTemperatureDto) {
    await this.getThermostat(id);

    return this.repo.updateThermostat(id, {
      targetTemp: dto.targetTemp,
      ecoMode: dto.ecoMode ?? false,
      updatedAt: new Date(),
    });
  }

  async logEnergy(thermostatId: string, dto: LogEnergyConsumptionDto) {
    await this.getThermostat(thermostatId);

    return this.repo.createEnergyLog({
      thermostatId,
      kwhConsumed: dto.kwhConsumed,
      loggedDate: dto.loggedDate ? new Date(dto.loggedDate) : new Date(),
    });
  }

  async getEnergyLogs(thermostatId: string) {
    await this.getThermostat(thermostatId);
    return this.repo.findEnergyLogs(thermostatId);
  }
}
