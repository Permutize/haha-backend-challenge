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

  async trackVisits(): Promise<string> {
    // Record visit in DB
    // const count = await this.dbService.inc('visit', true);
    // this.queueService.add('updateVisitCache', () => this.cacheManager.set('visit', count), true);
    // return `Visit recorded. Total visits: ${count}`;

    const currentCount = await this.cacheManager.get('visit') || await this.dbService.read('visit') || 0;
    const newVisitCount = currentCount + 1;
    this.queueService.add('updateVisitCache', () => this.dbService.write('visit', newVisitCount, true), true);
    await this.cacheManager.set('visit', newVisitCount, 60 * 1000);
    return `Visit recorded. Total visits: ${newVisitCount}`;
  }

  async getValueFromDB(): Promise<string> {
    const value = await this.dbService.read('visit');
    return `Value from DB: ${value}`;
  }
}
