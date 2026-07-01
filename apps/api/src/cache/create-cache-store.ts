import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

import { InMemoryCacheStore } from './in-memory-cache-store.js';
import { RedisCacheStore } from './redis-cache-store.js';
import type { CacheStore } from './cache-store.js';

export const createCacheStore = async (): Promise<CacheStore> => {
  if (!env.REDIS_URL) {
    return new InMemoryCacheStore();
  }

  const redisCacheStore = new RedisCacheStore(env.REDIS_URL);

  try {
    await redisCacheStore.connect();
    logger.info('Redis cache connected');
    return redisCacheStore;
  } catch (error) {
    logger.warn(error instanceof Error ? `Redis unavailable, using in-memory cache: ${error.message}` : 'Redis unavailable, using in-memory cache');
    return new InMemoryCacheStore();
  }
};
