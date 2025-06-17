import { AppService } from './app.service';
import { CacheService } from '../system/cache/cache.service';
import { DbService } from '../system/db/db.service';
import { QueueService } from '../system/queue/queue.service';

jest.mock('../system/cache/cache.service');
jest.mock('../system/db/db.service');
jest.mock('../system/queue/queue.service');

describe('AppService', () => {
  let appService: AppService;
  let dbService: jest.Mocked<DbService>;
  let cacheService: jest.Mocked<CacheService>;
  let queueService: jest.Mocked<QueueService>;

  beforeEach(() => {
    dbService = new DbService() as jest.Mocked<DbService>;
    dbService.read = jest.fn();
    dbService.write = jest.fn().mockResolvedValue(undefined);

    cacheService = new CacheService() as jest.Mocked<CacheService>;
    cacheService.get = jest.fn();
    cacheService.set = jest.fn();

    queueService = new QueueService() as jest.Mocked<QueueService>;
    queueService.add = jest.fn();

    appService = new AppService(
      cacheService,
      dbService,
      queueService,
    );
  });

  it('should increment visits when no previous value exists', async () => {
    cacheService.get.mockResolvedValueOnce(undefined);
    
    const result = await appService.trackVisits();

    expect(cacheService.get).toHaveBeenCalledWith('visit');
    expect(cacheService.set).toHaveBeenCalledWith('visit', 1);
    expect(result).toBe('Visit recorded. Total visits: 1');
  });

  it('should increment visits when previous value exists', async () => {
    cacheService.get.mockResolvedValueOnce(5);

    const result = await appService.trackVisits();

    expect(cacheService.get).toHaveBeenCalledWith('visit');
    expect(cacheService.set).toHaveBeenCalledWith('visit', 6);
    expect(result).toBe('Visit recorded. Total visits: 6');
  });

  it('should propagate cacheService.set errors', async () => {
    cacheService.get.mockResolvedValueOnce(2);
    cacheService.set.mockRejectedValueOnce(new Error('Cache error'));

    await expect(appService.trackVisits()).rejects.toThrow('Cache error');
  });
});