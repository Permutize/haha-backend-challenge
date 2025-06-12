import { CheckService } from './check.service';
import { DbService } from '../db/db.service';

jest.mock('../db/db.service');

describe('CheckService', () => {
  let checkService: CheckService;
  let dbService: jest.Mocked<DbService>;

  beforeEach(() => {
    dbService = new DbService() as jest.Mocked<DbService>;
    dbService.read = jest.fn();

    checkService = new CheckService(dbService);
  });

  it('should return visits from db when value exists', async () => {
    dbService.read.mockResolvedValueOnce(7);

    const result = await checkService.check();

    expect(dbService.read).toHaveBeenCalledWith('visit');
    expect(result).toBe('Visit recorder in DB: 7');
  });

  it('should return 0 when no visits value exists in db', async () => {
    dbService.read.mockResolvedValueOnce(undefined);

    const result = await checkService.check();

    expect(dbService.read).toHaveBeenCalledWith('visit');
    expect(result).toBe('Visit recorder in DB: 0');
  });

  it('should propagate dbService.read errors', async () => {
    dbService.read.mockRejectedValueOnce(new Error('DB error'));

    await expect(checkService.check()).rejects.toThrow('DB error');
  });
});