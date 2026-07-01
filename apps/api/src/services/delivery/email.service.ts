import type { Notification } from '../../domain/notification.js';

export interface EmailService {
  send(notification: Notification): Promise<void>;
}
