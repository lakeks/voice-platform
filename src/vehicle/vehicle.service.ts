import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class VehicleService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: [
        { make: 'asc' },
        { model: 'asc' },
      ],
    });
  }

  async getMakes(): Promise<string[]> {
    const vehicles = await this.findAll();

    return [...new Set(
      vehicles.map(vehicle => vehicle.make.toLowerCase())
    )];
  }

  async getModels(): Promise<string[]> {
    const vehicles = await this.findAll();

    return [...new Set(
      vehicles.map(vehicle => vehicle.model.toLowerCase())
    )];
  }
}
