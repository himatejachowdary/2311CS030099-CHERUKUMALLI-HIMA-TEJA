import { logger } from '../../config/logger.js';
import type { NotificationRepository } from '../../repositories/notification.repository.js';
import type { InMemoryNotificationQueue } from './notification-queue.js';
import type { DeliveryOrchestrator } from './delivery-orchestrator.js';

export class NotificationWorker {
  constructor(
    private readonly queue: InMemoryNotificationQueue,
    private readonly repository: NotificationRepository,
    private readonly orchestrator: DeliveryOrchestrator,
    private readonly retryLimit: number
  ) {}

  async start(): Promise<void> {
    await this.queue.registerHandler(async (job) => {
      await this.process(job.notificationId, job.attempts);
    });
  }

  private async process(notificationId: string, attempts: number): Promise<void> {
    const notification = await this.repository.findById(notificationId);

    if (!notification) {
      logger.warn(`Skipped delivery for missing notification ${notificationId}`);
      return;
    }

    let currentAttempt = attempts;

    while (currentAttempt < this.retryLimit) {
      try {
        await this.orchestrator.deliver(notification);
        return;
      } catch (error) {
        currentAttempt += 1;
        logger.error(error instanceof Error ? `Delivery attempt ${currentAttempt} failed for ${notification.id}: ${error.message}` : `Delivery attempt ${currentAttempt} failed for ${notification.id}`);

        if (currentAttempt >= this.retryLimit) {
          logger.error(`Delivery permanently failed for notification ${notification.id}`);
          return;
        }
      }
    }
  }
}
