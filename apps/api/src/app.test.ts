import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from './app.js';
import { createApplicationContext } from './bootstrap/create-application-context.js';

describe('API integration', () => {
  let app: ReturnType<typeof createApp>;
  let closeContext: (() => Promise<void>) | null = null;

  beforeAll(async () => {
    const context = await createApplicationContext();
    closeContext = context.close;
    app = createApp(context);
  });

  afterAll(async () => {
    if (closeContext) {
      await closeContext();
    }
  });

  it('serves health and notification data', async () => {
    const healthResponse = await request(app).get('/api/health');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.status).toBe('ok');

    const notificationsResponse = await request(app).get('/api/notifications');
    expect(notificationsResponse.status).toBe(200);
    expect(Array.isArray(notificationsResponse.body.data)).toBe(true);
    expect(notificationsResponse.body.meta.totalItems).toBeGreaterThan(0);
  });

  it('issues and verifies JWT tokens', async () => {
    const tokenResponse = await request(app).post('/api/auth/token').send({ studentId: 'student_001', role: 'student' });

    expect(tokenResponse.status).toBe(200);
    expect(typeof tokenResponse.body.token).toBe('string');

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenResponse.body.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.auth.studentId).toBe('student_001');
  });
});
