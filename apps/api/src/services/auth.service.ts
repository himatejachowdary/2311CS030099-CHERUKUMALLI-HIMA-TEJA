import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export class AuthService {
  issueToken(studentId: string, role: 'student' | 'admin' = 'student') {
    return jwt.sign({ studentId, role }, env.JWT_SECRET, {
      subject: studentId,
      expiresIn: '12h'
    });
  }
}
