import type { Notification } from '../../domain/notification.js';
import type { EmailService } from './email.service.js';
import type { PushService } from './push.service.js';
import type { SmsService } from './sms.service.js';

export class DeliveryOrchestrator {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService
  ) {}

  async deliver(notification: Notification): Promise<void> {
    await this.emailService.send(notification);
    await this.smsService.send(notification);
    await this.pushService.send(notification);
  }
}
