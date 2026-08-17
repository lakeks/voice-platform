import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ConversationModule } from './conversation/conversation.module';
import { StoresModule } from './stores/stores.module';
import { InventoryModule } from './inventory/inventory.module';
import { AssistantModule } from './assistant/assistant.module';
import { ParserModule } from './parser/parser.module';
import { CatalogModule } from './catalog/catalog.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { SearchModule } from './search/search.module';
import { IntentModule } from './intent/intent.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ConversationModule,
    StoresModule,
    InventoryModule,
    AssistantModule,
    ParserModule,
    CatalogModule,
    VehicleModule,
    SearchModule,
    IntentModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
