import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from 'src/system/cache/cache.module';
import { DbModule } from 'src/system/db/db.module';
import { QueueModule } from 'src/system/queue/queue.module';

@Module({
  imports: [DbModule, CacheModule, QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
