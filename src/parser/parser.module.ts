import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { ParserController } from './parser.controller';
import { ParserService } from './parser.service';

@Module({
  imports: [
    CatalogModule,
    VehicleModule,
  ],
  controllers: [ParserController],
  providers: [ParserService],
  exports: [ParserService],
})
export class ParserModule {}
