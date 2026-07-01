import { Router } from 'express';

import { NotificationsController } from '../controllers/notifications.controller.js';
import { optionalAuth } from '../middlewares/auth.js';

export const createNotificationsRouter = (controller: NotificationsController) => {
  const router = Router();

  router.get('/', optionalAuth, controller.list);
  router.get('/top', optionalAuth, controller.topTen);
  router.get('/:id', optionalAuth, controller.getById);
  router.post('/', optionalAuth, controller.create);
  router.patch('/:id/read', optionalAuth, controller.markAsRead);
  router.delete('/:id', optionalAuth, controller.delete);

  return router;
};
