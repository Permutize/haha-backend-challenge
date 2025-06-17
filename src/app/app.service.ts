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
  ) { }

  // Record visit in DB
  async trackVisits(): Promise<string> {
    let count = await this.cacheManager.get('visit');
    if (!count) {
      count = 1;
      await this.cacheManager.set('visit', count);
    } else {
      count++;
      await this.cacheManager.set('visit', count);
    }

    this.queueService.add('db', async () => {
      let count = await this.cacheManager.get('visit');
      await this.dbService.write('visit', count);
    });

    return `Visit recorded. Total visits: ${count}`;
  }
}
