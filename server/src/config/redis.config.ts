import Redis, { RedisOptions } from 'ioredis';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;
let isConnected = false;

const getRedisOptions = (): RedisOptions => {
  if (env.REDIS_URL) {
    return {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null; // stop retrying after 5 attempts
        return Math.min(times * 200, 2000);
      },
    };
  }
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
  };
};

export const initRedis = async (): Promise<boolean> => {
  if (!env.REDIS_ENABLED) {
    logger.info('ℹ️ Redis is disabled via configuration. Running in standalone mode.');
    return false;
  }

  try {
    const options = getRedisOptions();
    const uri = env.REDIS_URL || `${env.REDIS_HOST}:${env.REDIS_PORT}`;

    redisClient = env.REDIS_URL ? new Redis(env.REDIS_URL, options) : new Redis(options);

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info(`🔴 Redis connected successfully to [${uri}]`);
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      logger.warn(`⚠️ Redis connection error: ${err.message}`);
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    await redisClient.connect();
    return true;
  } catch (err: any) {
    isConnected = false;
    logger.warn(`⚠️ Could not connect to Redis: ${err.message}. Falling back to in-memory mode.`);
    return false;
  }
};

export const getRedisClient = (): Redis | null => {
  if (!env.REDIS_ENABLED || !isConnected) return null;
  return redisClient;
};

export const createPubSubPair = (): { pubClient: Redis; subClient: Redis } | null => {
  if (!env.REDIS_ENABLED) return null;

  try {
    const options = getRedisOptions();
    pubClient = env.REDIS_URL ? new Redis(env.REDIS_URL, options) : new Redis(options);
    subClient = pubClient.duplicate();

    return { pubClient, subClient };
  } catch (err: any) {
    logger.warn(`⚠️ Failed to create Redis pub/sub pair: ${err.message}`);
    return null;
  }
};

export const isRedisHealthy = async (): Promise<boolean> => {
  if (!env.REDIS_ENABLED || !redisClient || !isConnected) return false;
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('🔴 Main Redis connection closed.');
    } catch {
      // force disconnect if quit fails
      redisClient.disconnect();
    }
  }
  if (pubClient) {
    try {
      await pubClient.quit();
      await subClient?.quit();
      logger.info('🔴 Redis Pub/Sub connections closed.');
    } catch {
      pubClient.disconnect();
      subClient?.disconnect();
    }
  }
};
