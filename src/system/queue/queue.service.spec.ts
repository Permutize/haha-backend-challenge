import { QueueService } from './queue.service';

describe('QueueService', () => {
  let queueService: QueueService;

  beforeEach(() => {
    queueService = new QueueService();
  });

  it('should execute a single function added to the queue', async () => {
    const mockFn = jest.fn();
    queueService.add('test', mockFn);
    // Wait for the queue to process
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should execute multiple functions in order', async () => {
    const calls: number[] = [];
    queueService.add('test', () => calls.push(1));
    queueService.add('test', () => calls.push(2));
    queueService.add('test', () => calls.push(3));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(calls).toEqual([1, 2, 3]);
  });

  it('should support async functions in the queue', async () => {
    const calls: number[] = [];
    queueService.add('test', async () => {
      await new Promise((r) => setTimeout(r, 5));
      calls.push(1);
    });
    queueService.add('test', async () => {
      await new Promise((r) => setTimeout(r, 5));
      calls.push(2);
    });
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(calls).toEqual([1, 2]);
  });

  it('should not run the same queue concurrently', async () => {
    const order: number[] = [];
    queueService.add('test', async () => {
      order.push(1);
      await new Promise((r) => setTimeout(r, 15));
      order.push(2);
    });
    queueService.add('test', () => order.push(3));
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(order).toEqual([1, 2, 3]);
  });

  it('should replace the queue if rewrite is true', async () => {
    const calls: number[] = [];
    queueService.add('test', () => calls.push(1));
    queueService.add('test', () => calls.push(2), true); // rewrite
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(calls).toEqual([1, 2]);
  });

  it('should handle errors in queue functions gracefully', async () => {
    const calls: number[] = [];
    queueService.add('test', () => { throw new Error('fail'); });
    queueService.add('test', () => calls.push(1));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(calls).toEqual([1]);
  });

  it('should maintain separate queues for different names', async () => {
    const a: number[] = [];
    const b: number[] = [];
    queueService.add('queueA', () => a.push(1));
    queueService.add('queueB', () => b.push(2));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(a).toEqual([1]);
    expect(b).toEqual([2]);
  });
});