import { Injectable } from '@nestjs/common';
import { CacheService } from '../system/cache/cache.service';
import { DbService } from '../system/db/db.service';
import { QueueService } from '../system/queue/queue.service';

@Injectable()
export class AppService {
    constructor(
      private readonly cacheManager: CacheService,
      private readonly dbService: DbService,
      private readonly queueService: QueueService,
    ) {}

    // Record visit in DB
    async trackVisits(): Promise<string> {
      const key = 'visit';

      // Read current value from DB
      let cacheValue = await this.cacheManager.get(key);
      if (cacheValue) {
        cacheValue = cacheValue + 1;
        await this.cacheManager.set(key, cacheValue);
        this.queueService.add(`visi_updated_${cacheValue}`, () => this.dbService.write(key, cacheValue));
        return `Visit recorded. Total visits: ${cacheValue}`;
      } else {
        let value = await this.dbService.read(key);
        value = (value || 0 ) + 1;
        // Increment value in DB
        await this.cacheManager.set(key, value);
        this.queueService.add(`visi_updated_${value}`, () => this.dbService.write(key, 1));
        return `Visit recorded. Total visits: ${value}`;
      }
      

      // Write new value to DB
      // await this.dbService.write(key, value);
      // this.queueService.add(`visi_updated_${value}`, () => this.dbService.inc(key))

      // Show current value to user
    }
}
