import type { RequestHandler } from 'express';

import { AuthService } from '../services/auth.service.js';
import { createTokenBodySchema } from '../schemas/auth.schemas.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  createToken: RequestHandler = (request, response) => {
    const payload = createTokenBodySchema.parse(request.body);
    const token = this.authService.issueToken(payload.studentId, payload.role);

    response.status(200).json({
      token,
      tokenType: 'Bearer',
      studentId: payload.studentId,
      role: payload.role
    });
  };

  me: RequestHandler = (request, response) => {
    response.status(200).json({
      auth: request.auth ?? null
    });
  };
}
