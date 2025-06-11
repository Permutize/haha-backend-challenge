import { createKeyv, Keyv, RedisClientOptions } from '@keyv/redis';
import { Injectable, Logger } from '@nestjs/common';
import { CacheableMemory } from 'cacheable';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly redisCache: Keyv;
  private readonly memoryCache: Keyv;

  private readonly ttl = 30 * 1000;

  private cache: Keyv;

  constructor() {
    const url = `redis://127.0.0.1:6379`;
    const options: RedisClientOptions = {
      url,
    };
    this.redisCache = createKeyv(options);

    this.redisCache.on('error', (err) => {
      this.logger.error(
        'Redis cache error, falling back to memory cache',
        err.stack,
      );
      void this.redisCache.disconnect();
      this.cache = this.memoryCache;
    });

    this.memoryCache = new Keyv({
      store: new CacheableMemory({
        ttl: this.ttl,
        lruSize: 5000,
      }),
    });
    this.cache = this.memoryCache;

    // // eslint-disable-next-line @typescript-eslint/no-misused-promises
    // setTimeout(async () => {
    //   const connected = await this.checkRedisConnection();
    //   if (connected) {
    //     this.logger.log('Connected to redis cache');
    //     this.cache = this.redisCache;
    //   } else {
    //     this.logger.error(
    //       'Failed to connect to redis cache, using memory cache',
    //     );
    //   }
    // }, 3000);
  }

  async get<T = any>(
    key: string
  ): Promise<T | undefined> {
    const realKey = this.getCacheKey(key);
    return await this.cache.get<T>(realKey).catch((err) => {
      this.logger.error('Error getting data from cache', err.stack);
      return undefined;
    });
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<boolean> {
    if (ttl === undefined) {
      ttl = this.ttl;
    }
    const realKey = this.getCacheKey(key);
    return await this.cache.set(realKey, value, ttl);
  }

  async del(key: string): Promise<void> {
    const realKey = this.getCacheKey(key);
    await this.cache.delete(realKey);
  }

  private getCacheKey(key: string): string {
    return key;
  }

  private async checkRedisConnection(): Promise<boolean> {
    try {
      await this.redisCache.get('test');
      return true;
    } catch (err: any) {
      this.logger.error('Error checking redis connection', err.stack);
      return false;
    }
  }
}
