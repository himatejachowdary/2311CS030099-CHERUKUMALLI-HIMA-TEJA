import type { Notification, NotificationCreateInput, NotificationListFilters, NotificationListResult } from '../../domain/notification.js';
import { getPriorityFromType } from '../../domain/notification.js';
import type { NotificationRepository } from '../notification.repository.js';

export class MemoryNotificationRepository implements NotificationRepository {
  constructor(private readonly notifications: Notification[]) {}

  async list(filters: NotificationListFilters): Promise<NotificationListResult> {
    const filtered = this.applyFilters(filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      totalItems,
      totalPages,
      page,
      limit
    };
  }

  async listAll(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.find((notification) => notification.id === id) ?? null;
  }

  async create(input: NotificationCreateInput & { priority: number }): Promise<Notification> {
    const now = new Date();
    const notification: Notification = {
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      type: input.type,
      message: input.message,
      priority: input.priority ?? getPriorityFromType(input.type),
      createdAt: now,
      updatedAt: now,
      isRead: input.isRead ?? false,
      studentId: input.studentId
    };

    this.notifications.unshift(notification);
    return notification;
  }

  async updateReadStatus(id: string, isRead: boolean): Promise<Notification | null> {
    const notification = this.notifications.find((item) => item.id === id);

    if (!notification) {
      return null;
    }

    notification.isRead = isRead;
    notification.updatedAt = new Date();
    return notification;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.notifications.findIndex((notification) => notification.id === id);

    if (index < 0) {
      return false;
    }

    this.notifications.splice(index, 1);
    return true;
  }

  private applyFilters(filters: NotificationListFilters): Notification[] {
    const { search, type, priority, isRead, studentId, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    return [...this.notifications]
      .filter((notification) => {
        if (search && !notification.message.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }

        if (type && notification.type !== type) {
          return false;
        }

        if (typeof priority === 'number' && notification.priority !== priority) {
          return false;
        }

        if (typeof isRead === 'boolean' && notification.isRead !== isRead) {
          return false;
        }

        if (studentId && notification.studentId !== studentId) {
          return false;
        }

        return true;
      })
      .sort((left, right) => this.compare(left, right, sortBy, sortOrder));
  }

  private compare(
    left: Notification,
    right: Notification,
    sortBy: NonNullable<NotificationListFilters['sortBy']>,
    sortOrder: NonNullable<NotificationListFilters['sortOrder']>
  ) {
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'priority') {
      return (left.priority - right.priority) * direction;
    }

    if (sortBy === 'type') {
      return left.type.localeCompare(right.type) * direction;
    }

    if (sortBy === 'message') {
      return left.message.localeCompare(right.message) * direction;
    }

    return (left[sortBy].getTime() - right[sortBy].getTime()) * direction;
  }
}
