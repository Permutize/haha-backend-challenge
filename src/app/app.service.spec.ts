import { AppService } from './app.service';
import { CacheService } from '../system/cache/cache.service';
import { DbService } from '../system/db/db.service';
import { QueueService } from '../system/queue/queue.service';

jest.mock('../system/cache/cache.service');
jest.mock('../system/db/db.service');
jest.mock('../system/queue/queue.service');

describe('AppService', () => {
  let appService: AppService;
  let cacheService: jest.Mocked<CacheService>;
  let dbService: jest.Mocked<DbService>;
  let queueService: jest.Mocked<QueueService>;

  beforeEach(() => {
    cacheService = new CacheService() as jest.Mocked<CacheService>;
    dbService = new DbService() as jest.Mocked<DbService>;
    queueService = new QueueService() as jest.Mocked<QueueService>;
    appService = new AppService(cacheService, dbService, queueService);
  });

  describe('trackVisits', () => {
    it('should increment visit count in db and return message', async () => {
      dbService.read = jest.fn().mockResolvedValue(4);
      cacheService.get = jest.fn().mockResolvedValue(undefined);

      const result = await appService.trackVisits();
      console.log(result);
      expect(dbService.write).toHaveBeenCalledWith('visit', 5, true);
      expect(result).toBe('Visit recorded. Total visits: 5');
    });

    // it('should handle dbService.write returning 0', async () => {
    //   dbService.write = jest.fn().mockResolvedValue(0);

    //   const result = await appService.trackVisits();

    //   expect(dbService.write).toHaveBeenCalledWith('visit', 0, true);
    //   expect(result).toBe('Visit recorded. Total visits: 0');
    // });

    // it('should propagate errors from dbService.write', async () => {
    //   dbService.write = jest.fn().mockRejectedValue(new Error('DB error'));

    //   await expect(appService.trackVisits()).rejects.toThrow('DB error');
    //   expect(dbService.write).toHaveBeenCalledWith('visit', 100, true);
    // });
  });
});