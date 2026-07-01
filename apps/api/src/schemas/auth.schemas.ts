import { z } from 'zod';

export const createTokenBodySchema = z.object({
  studentId: z.string().min(1),
  role: z.enum(['student', 'admin']).default('student')
});
