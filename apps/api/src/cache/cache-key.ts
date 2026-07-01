import type { NotificationListFilters } from '../domain/notification.js';

export const notificationCacheKeys = {
  list(filters: NotificationListFilters) {
    return `notifications:list:${stableSerialize(filters)}`;
  },
  detail(notificationId: string) {
    return `notifications:detail:${notificationId}`;
  }
};

function stableSerialize(filters: NotificationListFilters) {
  const ordered = {
    search: filters.search ?? '',
    type: filters.type ?? '',
    priority: filters.priority ?? '',
    isRead: typeof filters.isRead === 'boolean' ? String(filters.isRead) : '',
    studentId: filters.studentId ?? '',
    sortBy: filters.sortBy ?? '',
    sortOrder: filters.sortOrder ?? '',
    page: filters.page ?? '',
    limit: filters.limit ?? ''
  };

  return JSON.stringify(ordered);
}
