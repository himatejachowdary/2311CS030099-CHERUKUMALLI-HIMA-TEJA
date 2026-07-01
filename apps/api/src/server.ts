import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { createApp } from './app.js';
import { createApplicationContext } from './bootstrap/create-application-context.js';

const context = await createApplicationContext();
const app = createApp(context);

const server = app.listen(env.PORT, () => {
  logger.info(`API server running on port ${env.PORT}`);
});

const shutdown = async () => {
  server.close();
  await context.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
