import type { Notification } from '../../domain/notification.js';

export interface PushService {
  send(notification: Notification): Promise<void>;
}
