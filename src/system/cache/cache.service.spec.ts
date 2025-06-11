import { CacheService } from './cache.service';
import * as nestCommon from '@nestjs/common';

jest.spyOn(nestCommon.Logger.prototype, 'log').mockImplementation(jest.fn());
jest.spyOn(nestCommon.Logger.prototype, 'error').mockImplementation(jest.fn());

const mockKeyv = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  on: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('@keyv/redis', () => ({
  createKeyv: jest.fn(() => mockKeyv),
  Keyv: jest.fn(() => mockKeyv),
}));

jest.mock('cacheable', () => ({
  CacheableMemory: jest.fn(),
}));

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService = new CacheService();
    // Use memoryCache for all tests to avoid async redis switching
    (cacheService as any).cache = mockKeyv;
  });

  describe('get', () => {
    it('should return value from cache', async () => {
      mockKeyv.get.mockResolvedValueOnce('value');
      const result = await cacheService.get('key');
      expect(mockKeyv.get).toHaveBeenCalledWith('key');
      expect(result).toBe('value');
    });

    it('should return undefined and log error if get fails', async () => {
      mockKeyv.get.mockRejectedValueOnce(new Error('fail'));
      const loggerError = jest.spyOn((cacheService as any).logger, 'error');
      const result = await cacheService.get('key');
      expect(loggerError).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set value with default ttl', async () => {
      mockKeyv.set.mockResolvedValueOnce(true);
      const result = await cacheService.set('key', 'val');
      expect(mockKeyv.set).toHaveBeenCalledWith('key', 'val', 30000);
      expect(result).toBe(true);
    });

    it('should set value with custom ttl', async () => {
      mockKeyv.set.mockResolvedValueOnce(true);
      const result = await cacheService.set('key', 'val', 1000);
      expect(mockKeyv.set).toHaveBeenCalledWith('key', 'val', 1000);
      expect(result).toBe(true);
    });
  });

  describe('del', () => {
    it('should delete value from cache', async () => {
      mockKeyv.delete.mockResolvedValueOnce(undefined);
      await cacheService.del('key');
      expect(mockKeyv.delete).toHaveBeenCalledWith('key');
    });
  });

  describe('getCacheKey', () => {
    it('should return the same key', () => {
      // @ts-expect-error: testing private method
      expect(cacheService.getCacheKey('abc')).toBe('abc');
    });
  });

  describe('checkRedisConnection', () => {
    it('should return true if redis get succeeds', async () => {
      mockKeyv.get.mockResolvedValueOnce('ok');
      // @ts-expect-error: testing private method
      const result = await cacheService.checkRedisConnection();
      expect(result).toBe(true);
    });

    it('should return false and log error if redis get fails', async () => {
      mockKeyv.get.mockRejectedValueOnce(new Error('fail'));
      const loggerError = jest.spyOn((cacheService as any).logger, 'error');
      // @ts-expect-error: testing private method
      const result = await cacheService.checkRedisConnection();
      expect(loggerError).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});