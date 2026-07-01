import type { RequestHandler } from 'express';

import { getPriorityLabel, type NotificationPriorityWeight } from '../domain/notification.js';
import { notificationIdParamsSchema, createNotificationBodySchema, notificationQuerySchema } from '../schemas/notification.schemas.js';
import { NotificationService } from '../services/notification.service.js';

export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  list: RequestHandler = async (request, response) => {
    const filters = notificationQuerySchema.parse(request.query);
    const result = await this.notificationService.listNotifications(filters);

    response.status(200).json({
      data: result.data.map((notification) => this.presentNotification(notification)),
      meta: {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      }
    });
  };

  getById: RequestHandler = async (request, response) => {
    const { id } = notificationIdParamsSchema.parse(request.params);
    const notification = await this.notificationService.getNotificationById(id);

    response.status(200).json({
      data: this.presentNotification(notification)
    });
  };

  create: RequestHandler = async (request, response) => {
    const body = createNotificationBodySchema.parse(request.body);
    const notification = await this.notificationService.createNotification(body);

    response.status(201).json({
      data: this.presentNotification(notification)
    });
  };

  markAsRead: RequestHandler = async (request, response) => {
    const { id } = notificationIdParamsSchema.parse(request.params);
    const notification = await this.notificationService.markAsRead(id);

    response.status(200).json({
      data: this.presentNotification(notification)
    });
  };

  delete: RequestHandler = async (request, response) => {
    const { id } = notificationIdParamsSchema.parse(request.params);
    await this.notificationService.deleteNotification(id);

    response.status(200).json({
      message: 'Notification deleted'
    });
  };

  topTen: RequestHandler = async (_request, response) => {
    const notifications = await this.notificationService.getTopNotifications(10);

    response.status(200).json({
      data: notifications.map((notification) => this.presentNotification(notification))
    });
  };

  private presentNotification(notification: {
    id: string;
    type: string;
    message: string;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
    isRead: boolean;
    studentId: string;
  }) {
    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
      priorityLabel: getPriorityLabel(notification.priority as NotificationPriorityWeight)
    };
  }
}
