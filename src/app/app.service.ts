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

    async trackVisits(): Promise<string> {
      // Record visit in DB
      const count = await this.dbService.inc('visit', true);

      return `Visit recorded. Total visits: ${count}`;
    }
}
