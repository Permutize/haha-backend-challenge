import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name);
  // In-memory store to remember data between writes and reads
  private store = new Map<string, any>();
  private lastWrite = 0;
  private writeCount = 0;
  private baseTimeout = 100; // ms
  private maxTimeout = 3000; // ms

  async write(key: string, value: any, withLogs = false): Promise<void> {
    const now = Date.now();
    if (now - this.lastWrite < 2000) {
      this.writeCount++;
    } else {
      this.writeCount = 1;
    }
    this.lastWrite = now;

    const timeout = Math.min(this.baseTimeout * this.writeCount, this.maxTimeout);
    if (withLogs) {
      this.logger.debug(`Writing to DB with timeout ${timeout}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, timeout));
    // Remember data in the store
    this.store.set(key, value);
  }

  async inc(key: string, withLogs = false): Promise<number> {
    const value = await this.read(key);
    await this.write(key, (value || 0) + 1, withLogs);
    return await this.read(key);
  }

  async read<T = any>(key: string): Promise<T | undefined> {
    // Simulate a small read delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Retrieve remembered data
    return this.store.get(key);
  }
}