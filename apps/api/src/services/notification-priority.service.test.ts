import { describe, expect, it } from 'vitest';

import { NotificationPriorityService } from './notification-priority.service.js';
import type { Notification } from '../domain/notification.js';

const createNotification = (id: string, type: Notification['type'], createdAt: string): Notification => ({
  id,
  type,
  message: `${type} message`,
  priority: type === 'Placement' ? 100 : type === 'Result' ? 80 : 50,
  createdAt: new Date(createdAt),
  updatedAt: new Date(createdAt),
  isRead: false,
  studentId: 'student_001'
});

describe('NotificationPriorityService', () => {
  it('returns the highest priority notification first', () => {
    const service = new NotificationPriorityService();
    service.insert(createNotification('1', 'Event', '2026-01-01T00:00:00.000Z'));
    service.insert(createNotification('2', 'Placement', '2026-01-02T00:00:00.000Z'));
    service.insert(createNotification('3', 'Result', '2026-01-03T00:00:00.000Z'));

    expect(service.peek()?.id).toBe('2');
    expect(service.topTen().map((notification) => notification.id)).toEqual(['2', '3', '1']);
  });

  it('removes notifications by id', () => {
    const service = new NotificationPriorityService();
    service.insert(createNotification('1', 'Event', '2026-01-01T00:00:00.000Z'));
    service.insert(createNotification('2', 'Placement', '2026-01-02T00:00:00.000Z'));

    expect(service.remove('2')?.id).toBe('2');
    expect(service.peek()?.id).toBe('1');
  });
});
