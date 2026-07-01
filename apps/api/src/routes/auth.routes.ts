import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const createAuthRouter = (controller: AuthController) => {
  const router = Router();

  router.post('/token', controller.createToken);
  router.get('/me', requireAuth, controller.me);

  return router;
};
