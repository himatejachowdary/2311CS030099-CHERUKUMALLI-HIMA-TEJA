import { HttpError } from '../errors/http-error.js';
import type { CacheStore } from '../cache/cache-store.js';
import { notificationCacheKeys } from '../cache/cache-key.js';
import { getPriorityFromType, type Notification, type NotificationCreateInput, type NotificationListFilters } from '../domain/notification.js';
import type { NotificationRepository } from '../repositories/notification.repository.js';
import type { StudentRepository } from '../repositories/student.repository.js';
import type { NotificationPriorityService } from './notification-priority.service.js';
import type { InMemoryNotificationQueue } from './delivery/notification-queue.js';

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly studentRepository: StudentRepository,
    private readonly cacheStore: CacheStore,
    private readonly cacheTtlSeconds: number,
    private readonly priorityService: NotificationPriorityService,
    private readonly notificationQueue: InMemoryNotificationQueue
  ) {}

  async bootstrap(): Promise<void> {
    await this.refreshPriorityQueue();
  }

  async listNotifications(filters: NotificationListFilters) {
    const cacheKey = notificationCacheKeys.list(filters);
    const cached = await this.cacheStore.get<ReturnType<NotificationRepository['list']>>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.notificationRepository.list(filters);
    await this.cacheStore.set(cacheKey, result, this.cacheTtlSeconds);
    return result;
  }

  async getNotificationById(id: string): Promise<Notification> {
    const cacheKey = notificationCacheKeys.detail(id);
    const cached = await this.cacheStore.get<Notification>(cacheKey);

    if (cached) {
      return cached;
    }

    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new HttpError(404, 'Notification not found');
    }

    await this.cacheStore.set(cacheKey, notification, this.cacheTtlSeconds);
    return notification;
  }

  async createNotification(input: NotificationCreateInput): Promise<Notification> {
    const student = await this.studentRepository.findById(input.studentId);

    if (!student) {
      throw new HttpError(400, 'Student not found');
    }

    const notification = await this.notificationRepository.create({
      ...input,
      priority: getPriorityFromType(input.type)
    });

    this.priorityService.insert(notification);
    await this.invalidateCaches();
    await this.notificationQueue.enqueue({ notificationId: notification.id, attempts: 0 });
    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.updateReadStatus(id, true);

    if (!notification) {
      throw new HttpError(404, 'Notification not found');
    }

    this.priorityService.remove(id);
    this.priorityService.insert(notification);
    await this.invalidateCaches();
    return notification;
  }

  async deleteNotification(id: string): Promise<void> {
    const deleted = await this.notificationRepository.delete(id);

    if (!deleted) {
      throw new HttpError(404, 'Notification not found');
    }

    this.priorityService.remove(id);
    await this.invalidateCaches();
  }

  async getTopNotifications(limit = 10): Promise<Notification[]> {
    return this.priorityService.topTen().slice(0, limit);
  }

  private async refreshPriorityQueue(): Promise<void> {
    const notifications = await this.notificationRepository.listAll();
    this.priorityService.rebuild(notifications);
  }

  private async invalidateCaches(): Promise<void> {
    await this.cacheStore.clear();
    await this.refreshPriorityQueue();
  }
}
