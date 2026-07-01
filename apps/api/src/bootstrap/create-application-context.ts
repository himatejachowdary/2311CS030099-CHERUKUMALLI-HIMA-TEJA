import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { createCacheStore } from '../cache/create-cache-store.js';
import { createPrismaClient } from '../prisma/prisma-client.js';
import { seededNotifications, seededStudents } from '../repositories/memory/memory-data.js';
import { MemoryNotificationRepository } from '../repositories/memory/memory-notification.repository.js';
import { MemoryStudentRepository } from '../repositories/memory/memory-student.repository.js';
import { PrismaNotificationRepository } from '../repositories/prisma/prisma-notification.repository.js';
import { PrismaStudentRepository } from '../repositories/prisma/prisma-student.repository.js';
import { AuthController } from '../controllers/auth.controller.js';
import { NotificationsController } from '../controllers/notifications.controller.js';
import { AuthService } from '../services/auth.service.js';
import { DeliveryOrchestrator } from '../services/delivery/delivery-orchestrator.js';
import { InMemoryNotificationQueue } from '../services/delivery/notification-queue.js';
import { MockEmailService } from '../services/delivery/mock-email.service.js';
import { MockPushService } from '../services/delivery/mock-push.service.js';
import { MockSmsService } from '../services/delivery/mock-sms.service.js';
import { NotificationWorker } from '../services/delivery/notification-worker.js';
import { NotificationPriorityService } from '../services/notification-priority.service.js';
import { NotificationService } from '../services/notification.service.js';

export interface ApplicationContext {
  authController: AuthController;
  notificationsController: NotificationsController;
  close: () => Promise<void>;
}

export const createApplicationContext = async (): Promise<ApplicationContext> => {
  const cacheStore = await createCacheStore();
  const prismaClient = createPrismaClient();
  let notificationRepository: MemoryNotificationRepository | PrismaNotificationRepository = new MemoryNotificationRepository([...seededNotifications]);
  let studentRepository: MemoryStudentRepository | PrismaStudentRepository = new MemoryStudentRepository([...seededStudents]);
  let closePrisma: () => Promise<void> = async () => {};

  if (env.DATABASE_URL) {
    try {
      await prismaClient.$connect();
      notificationRepository = new PrismaNotificationRepository(prismaClient);
      studentRepository = new PrismaStudentRepository(prismaClient);
      closePrisma = async () => {
        await prismaClient.$disconnect();
      };
      logger.info('Prisma database connected');
    } catch (error) {
      logger.warn(error instanceof Error ? `Prisma unavailable, using in-memory store: ${error.message}` : 'Prisma unavailable, using in-memory store');
    }
  } else {
    notificationRepository = new MemoryNotificationRepository([...seededNotifications]);
    studentRepository = new MemoryStudentRepository([...seededStudents]);
  }

  const notificationQueue = new InMemoryNotificationQueue();
  const priorityService = new NotificationPriorityService();
  const deliveryOrchestrator = new DeliveryOrchestrator(new MockEmailService(), new MockSmsService(), new MockPushService());
  const notificationWorker = new NotificationWorker(notificationQueue, notificationRepository, deliveryOrchestrator, env.DELIVERY_RETRY_LIMIT);
  const notificationService = new NotificationService(
    notificationRepository,
    studentRepository,
    cacheStore,
    env.CACHE_TTL_SECONDS,
    priorityService,
    notificationQueue
  );
  const authService = new AuthService();

  await notificationService.bootstrap();
  await notificationWorker.start();

  return {
    authController: new AuthController(authService),
    notificationsController: new NotificationsController(notificationService),
    close: async () => {
      await cacheStore.disconnect();
      await closePrisma();
    }
  };
};
