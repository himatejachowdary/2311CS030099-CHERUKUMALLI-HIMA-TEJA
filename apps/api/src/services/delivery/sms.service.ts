import type { Notification } from '../../domain/notification.js';

export interface SmsService {
  send(notification: Notification): Promise<void>;
}
