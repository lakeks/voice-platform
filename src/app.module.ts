import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ConversationModule } from './conversation/conversation.module';
import { StoresModule } from './stores/stores.module';

@Module({
  imports: [ConfigModule, DatabaseModule, ConversationModule, StoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
