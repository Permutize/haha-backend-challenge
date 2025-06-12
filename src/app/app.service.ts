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
      let value = await this.dbService.read(key);

      // Increment value in DB
      value = (value || 0) + 1;

      // Write new value to DB
      await this.dbService.write(key, value);

      // Show current value to user
      return `Visit recorded. Total visits: ${value}`;
    }
}
