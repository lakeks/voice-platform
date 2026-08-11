import { Controller, Get } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
  ) {}

  @Get()
  async findAll() {
    return await this.vehicleService.findAll();
  }

  @Get('makes')
  async getMakes() {
    return await this.vehicleService.getMakes();
  }

  @Get('models')
  async getModels() {
    return await this.vehicleService.getModels();
  }
}
