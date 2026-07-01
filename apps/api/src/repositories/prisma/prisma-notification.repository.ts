import type { PrismaClient } from '@prisma/client';

import type {
  Notification,
  NotificationCreateInput,
  NotificationListFilters,
  NotificationListResult,
  NotificationType
} from '../../domain/notification.js';
import { getPriorityFromType } from '../../domain/notification.js';
import type { NotificationRepository } from '../notification.repository.js';

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: NotificationListFilters): Promise<NotificationListResult> {
    const { page = 1, limit = 10, search, type, priority, isRead, studentId, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const where = {
      ...(search
        ? { message: { contains: search, mode: 'insensitive' as const } }
        : {}),
      ...(type ? { notificationType: type } : {}),
      ...(typeof priority === 'number' ? { priority } : {}),
      ...(typeof isRead === 'boolean' ? { isRead } : {}),
      ...(studentId ? { studentId } : {})
    };

    const [totalItems, records] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: this.buildOrderBy(sortBy, sortOrder)
      })
    ]);

    return {
      data: records.map((record) => this.mapNotification(record)),
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      page,
      limit
    };
  }

  async listAll(): Promise<Notification[]> {
    const records = await this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map((record) => this.mapNotification(record));
  }

  async findById(id: string): Promise<Notification | null> {
    const record = await this.prisma.notification.findUnique({ where: { id } });
    return record ? this.mapNotification(record) : null;
  }

  async create(input: NotificationCreateInput & { priority: number }): Promise<Notification> {
    const record = await this.prisma.notification.create({
      data: {
        notificationType: input.type,
        message: input.message,
        priority: input.priority ?? getPriorityFromType(input.type),
        isRead: input.isRead ?? false,
        studentId: input.studentId
      }
    });

    return this.mapNotification(record);
  }

  async updateReadStatus(id: string, isRead: boolean): Promise<Notification | null> {
    const record = await this.prisma.notification.updateMany({
      where: { id },
      data: { isRead }
    });

    if (record.count === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const record = await this.prisma.notification.deleteMany({ where: { id } });
    return record.count > 0;
  }

  private buildOrderBy(sortBy: NonNullable<NotificationListFilters['sortBy']>, sortOrder: NonNullable<NotificationListFilters['sortOrder']>) {
    if (sortBy === 'type') {
      return { notificationType: sortOrder };
    }

    if (sortBy === 'message') {
      return { message: sortOrder };
    }

    return { [sortBy]: sortOrder };
  }

  private mapNotification(record: {
    id: string;
    notificationType: string;
    message: string;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
    isRead: boolean;
    studentId: string;
  }): Notification {
    return {
      id: record.id,
      type: record.notificationType as NotificationType,
      message: record.message,
      priority: record.priority,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      isRead: record.isRead,
      studentId: record.studentId
    };
  }
}
