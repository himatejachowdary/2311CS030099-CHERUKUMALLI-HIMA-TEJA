import { logger } from '../../config/logger.js';
import type { Notification } from '../../domain/notification.js';
import type { EmailService } from './email.service.js';

export class MockEmailService implements EmailService {
  async send(notification: Notification): Promise<void> {
    logger.info(`Mock email sent for notification ${notification.id}`);
  }
}
