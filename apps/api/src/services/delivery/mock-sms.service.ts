import { logger } from '../../config/logger.js';
import type { Notification } from '../../domain/notification.js';
import type { SmsService } from './sms.service.js';

export class MockSmsService implements SmsService {
  async send(notification: Notification): Promise<void> {
    logger.info(`Mock SMS sent for notification ${notification.id}`);
  }
}
