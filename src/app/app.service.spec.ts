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

  beforeEach(() => {
    dbService = new DbService() as jest.Mocked<DbService>;
    dbService.read = jest.fn();
    dbService.write = jest.fn().mockResolvedValue(undefined);
    cacheService = new CacheService() as jest.Mocked<CacheService>;
    cacheService.get = jest.fn();
    cacheService.set = jest.fn();

    appService = new AppService(
      new CacheService() as any,
      dbService,
      new QueueService() as any,
    );
  });

  it('should increment visits when no previous value exists', async () => {
    dbService.read.mockResolvedValueOnce(undefined);

    const result = await appService.trackVisits();

    expect(dbService.read).toHaveBeenCalledWith('visit');
    expect(dbService.write).toHaveBeenCalledWith('visit', 1);
    expect(result).toBe('Visit recorded. Total visits: 1');
  });

  it('should increment visits when previous value exists', async () => {
    dbService.read.mockResolvedValueOnce(5);

    const result = await appService.trackVisits();

    // expect(dbService.read).toHaveBeenCalledWith('visit');
    expect(cacheService.get).toHaveBeenCalledWith('visit', 5);
    expect(cacheService.set).toHaveBeenCalledWith('visit', 6);
    expect(dbService.write).toHaveBeenCalledWith('visit', 6);
    expect(result).toBe('Visit recorded. Total visits: 6');
  });

  it('should propagate dbService.write errors', async () => {
    dbService.read.mockResolvedValueOnce(2);
    dbService.write.mockRejectedValueOnce(new Error('DB error'));

    await expect(appService.trackVisits()).rejects.toThrow('DB error');
  });
});