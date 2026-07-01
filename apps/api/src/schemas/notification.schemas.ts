import { z } from 'zod';

import { NotificationTypePriorityWeights, NotificationTypes } from '../domain/notification.js';

const priorityQuerySchema = z
  .union([z.coerce.number().int().min(1), z.enum(['Event', 'Result', 'Placement'])])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'number') {
      return value;
    }

    return NotificationTypePriorityWeights[value];
  });

const readFilterSchema = z
  .union([z.literal('true'), z.literal('false'), z.boolean()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    return value === true || value === 'true';
  });

export const notificationIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const createNotificationBodySchema = z.object({
  type: z.enum(NotificationTypes),
  message: z.string().trim().min(3),
  studentId: z.string().min(1),
  isRead: z.boolean().optional()
});

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  type: z.enum(NotificationTypes).optional(),
  priority: priorityQuerySchema,
  isRead: readFilterSchema,
  studentId: z.string().min(1).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'type', 'message']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
