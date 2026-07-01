export const NotificationTypes = ['Event', 'Result', 'Placement'] as const;

export type NotificationType = (typeof NotificationTypes)[number];

export const NotificationTypePriorityWeights: Record<NotificationType, number> = {
  Placement: 100,
  Result: 80,
  Event: 50
};

export const NotificationPriorityLabels = {
  100: 'Placement',
  80: 'Result',
  50: 'Event'
} as const;

export type NotificationPriorityWeight = (typeof NotificationTypePriorityWeights)[NotificationType];

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  studentId: string;
}

export interface NotificationCreateInput {
  type: NotificationType;
  message: string;
  studentId: string;
  isRead?: boolean | undefined;
}

export interface NotificationListFilters {
  search?: string | undefined;
  type?: NotificationType | undefined;
  priority?: number | undefined;
  isRead?: boolean | undefined;
  studentId?: string | undefined;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'type' | 'message' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface NotificationListResult {
  data: Notification[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface NotificationQueryKey {
  search?: string;
  type?: NotificationType;
  priority?: number;
  isRead?: boolean;
  studentId?: string;
  sortBy?: string;
  sortOrder?: string;
  page: number;
  limit: number;
}

export const notificationTypeFromPriority = (priority: number): NotificationType | null => {
  if (priority === 100) {
    return 'Placement';
  }

  if (priority === 80) {
    return 'Result';
  }

  if (priority === 50) {
    return 'Event';
  }

  return null;
};

export const getPriorityFromType = (type: NotificationType): number => {
  return NotificationTypePriorityWeights[type];
};

export const getPriorityLabel = (priority: number): string => {
  return NotificationPriorityLabels[priority as keyof typeof NotificationPriorityLabels] ?? 'Custom';
};
