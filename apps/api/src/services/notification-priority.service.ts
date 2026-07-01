import { MaxHeap } from '../utils/heap.js';
import { getPriorityFromType, type Notification } from '../domain/notification.js';

interface HeapItem {
  notification: Notification;
}

export class NotificationPriorityService {
  private readonly heap = new MaxHeap<HeapItem>((left, right) => {
    if (left.notification.priority !== right.notification.priority) {
      return left.notification.priority - right.notification.priority;
    }

    return left.notification.createdAt.getTime() - right.notification.createdAt.getTime();
  });

  insert(notification: Notification) {
    this.heap.insert({ notification: this.normalize(notification) });
  }

  remove(notificationId?: string): Notification | undefined {
    if (!notificationId) {
      return this.heap.remove()?.notification;
    }

    return this.heap.removeBy((item) => item.notification.id === notificationId)?.notification;
  }

  peek(): Notification | undefined {
    return this.heap.peek()?.notification;
  }

  topTen(): Notification[] {
    return this.heap.top(10).map((item) => item.notification);
  }

  clear() {
    this.heap.clear();
  }

  rebuild(notifications: Notification[]) {
    this.clear();
    notifications.forEach((notification) => this.insert(notification));
  }

  private normalize(notification: Notification): Notification {
    if (notification.priority) {
      return notification;
    }

    return {
      ...notification,
      priority: getPriorityFromType(notification.type)
    };
  }
}
