import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { HttpError } from '../errors/http-error.js';

export interface AuthPayload {
  studentId: string;
  role: 'student' | 'admin';
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthPayload | undefined;
  }
}

export const optionalAuth = (request: Request, _response: Response, next: NextFunction) => {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    return next();
  }

  try {
    request.auth = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  } catch {
    request.auth = undefined;
  }

  return next();
};

export const requireAuth = (request: Request, _response: Response, next: NextFunction) => {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    return next(new HttpError(401, 'Authorization token is required'));
  }

  try {
    request.auth = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid authorization token'));
  }
};

function extractBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}
