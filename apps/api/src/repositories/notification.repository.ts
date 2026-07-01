import type { Notification, NotificationCreateInput, NotificationListFilters, NotificationListResult } from '../domain/notification.js';

export interface NotificationRepository {
  list(filters: NotificationListFilters): Promise<NotificationListResult>;
  listAll(): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  create(input: NotificationCreateInput & { priority: number }): Promise<Notification>;
  updateReadStatus(id: string, isRead: boolean): Promise<Notification | null>;
  delete(id: string): Promise<boolean>;
}
