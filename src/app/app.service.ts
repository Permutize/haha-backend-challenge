import { Injectable } from '@nestjs/common';
import { CacheService } from '../system/cache/cache.service';
import { DbService } from '../system/db/db.service';
import { QueueService } from '../system/queue/queue.service';

@Injectable()
export class AppService {
    key: string = 'visit'; 
    constructor(
      private readonly cacheManager: CacheService,
      private readonly dbService: DbService,
      private readonly queueService: QueueService,
    ) {}

    async syncCacheToDatabase(): Promise<void> {
      // Fetch data from cache
      const cache = await this.cacheManager.get(this.key);
      if (cache) {
        // Write to DB
        await this.dbService.write(this.key, cache);
      } else {
        // Read from DB
        const dbValue = await this.dbService.read(this.key);
        // Write to cache
        await this.cacheManager.set(this.key, dbValue);
      }
    }

    // Record visit in DB
    async trackVisits(): Promise<string> {
      // Read current value from DB
      let value = await this.cacheManager.get(this.key);
      if (!value) {
        value = await this.dbService.read(this.key);
      }

      // Increment value in DB
      value = (value || 0) + 1;
      try {
        this.dbService.write(this.key, value)
      } catch (error) {}
      
      this.queueService.add(`write_cache:${this.key}`, async () => {
        await this.cacheManager.set(this.key, value);
        
        this.queueService.add(`write_db:${this.key}`, async () => {
          await this.syncCacheToDatabase()
        })
      })

      return `Visit recorded. Total visits: ${value}`;
    }
}
