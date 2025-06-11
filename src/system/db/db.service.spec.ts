import { DbService } from './db.service';

describe('DbService', () => {
  let dbService: DbService;

  beforeEach(() => {
    dbService = new DbService();
  });

  it('should write and read a value', async () => {
    await dbService.write('foo', 'bar');
    const result = await dbService.read('foo');
    expect(result).toBe('bar');
  });

  it('should return undefined for unknown key', async () => {
    const result = await dbService.read('unknown');
    expect(result).toBeUndefined();
  });

  it('should increase write delay with rapid writes', async () => {
    const start = Date.now();
    await dbService.write('a', 1);
    await dbService.write('b', 2);
    await dbService.write('c', 3);
    const duration = Date.now() - start;
    // The delay should be at least baseTimeout + 2*baseTimeout + 3*baseTimeout = 100 + 200 + 300 = 600ms
    expect(duration).toBeGreaterThanOrEqual(600);
    expect(await dbService.read('c')).toBe(3);
  });

  it('should reset writeCount if enough time passes between writes', async () => {
    await dbService.write('x', 10);
    await new Promise((resolve) => setTimeout(resolve, 1100)); // wait > 1000ms
    const start = Date.now();
    await dbService.write('y', 20);
    const duration = Date.now() - start;
    // Should only wait baseTimeout (100ms)
    expect(duration).toBeGreaterThanOrEqual(100);
    expect(duration).toBeLessThan(250);
    expect(await dbService.read('y')).toBe(20);
  });

  it('should cap the write delay at maxTimeout', async () => {
    // Simulate many rapid writes
    const writes = [];
    for (let i = 0; i < 30; i++) {
      writes.push(dbService.write(`key${i}`, i));
    }
    const start = Date.now();
    await Promise.all(writes);
    const duration = Date.now() - start;
    // The last write should not exceed maxTimeout (2000ms)
    expect(duration).toBeGreaterThanOrEqual(2000);
    expect(duration).toBeLessThan(5000);
    expect(await dbService.read('key29')).toBe(29);
  });
});