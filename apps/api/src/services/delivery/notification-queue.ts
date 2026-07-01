export interface DeliveryJob {
  notificationId: string;
  attempts: number;
}

type JobHandler = (job: DeliveryJob) => Promise<void>;

export class InMemoryNotificationQueue {
  private readonly jobs: DeliveryJob[] = [];
  private handler: JobHandler | null = null;
  private processing = false;

  async enqueue(job: DeliveryJob): Promise<void> {
    this.jobs.push(job);
    void this.flush();
  }

  async registerHandler(handler: JobHandler): Promise<void> {
    this.handler = handler;
    void this.flush();
  }

  size() {
    return this.jobs.length;
  }

  private async flush(): Promise<void> {
    if (this.processing || !this.handler) {
      return;
    }

    this.processing = true;

    try {
      while (this.jobs.length > 0) {
        const job = this.jobs.shift();

        if (!job) {
          continue;
        }

        await this.handler(job);
      }
    } finally {
      this.processing = false;
    }
  }
}
