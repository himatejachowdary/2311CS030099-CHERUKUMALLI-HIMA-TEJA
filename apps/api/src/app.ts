import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { AuthController } from './controllers/auth.controller.js';
import { NotificationsController } from './controllers/notifications.controller.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { healthRouter } from './routes/health.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createNotificationsRouter } from './routes/notifications.routes.js';

export interface ApplicationDependencies {
  authController: AuthController;
  notificationsController: NotificationsController;
}

export const createApp = ({ authController, notificationsController }: ApplicationDependencies) => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN ?? true,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api', (_request, response) => {
    response.json({
      name: 'Campus Notification Management System API',
      version: '1.0.0'
    });
  });

  app.use('/api/health', healthRouter);
  app.use('/api/auth', createAuthRouter(authController));
  app.use('/api/notifications', createNotificationsRouter(notificationsController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  logger.info('API application initialized');

  return app;
};
