import { Injectable } from "@nestjs/common";

@Injectable()
export class QueueService {
  private queues: Record<string, Array<() => Promise<any> | any>> = {};
  private running = new Map<string, boolean>();

  add(queueName: string, fn: () => Promise<any> | any, rewrite = false): void {
    if (rewrite) {
      this.queues[queueName] = [fn];
    } else {
      if (!this.queues[queueName]) {
        this.queues[queueName] = [];
      }
      this.queues[queueName].push(fn);
    }
    this.runQueue(queueName);
  }

  private async runQueue(queueName) {
    if (this.running.get(queueName)) return;
    this.running.set(queueName, true);
    while (this.queues[queueName].length > 0) {
      const fn = this.queues[queueName].shift();
      if (fn) {
        try {
          await fn();
        } catch (e) {
          // Handle error if needed
        }
      }
    }
    this.running.set(queueName,  false);
  }
}