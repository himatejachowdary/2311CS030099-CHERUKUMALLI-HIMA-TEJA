import { logger } from '../../config/logger.js';
import type { Notification } from '../../domain/notification.js';
import type { PushService } from './push.service.js';

export class MockPushService implements PushService {
  async send(notification: Notification): Promise<void> {
    logger.info(`Mock push notification sent for notification ${notification.id}`);
  }
}
