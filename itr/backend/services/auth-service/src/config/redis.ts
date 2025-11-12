import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

export const setCache = async (key: string, value: string, expirySeconds?: number): Promise<void> => {
  try {
    if (expirySeconds) {
      await redisClient.setEx(key, expirySeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    logger.error('Redis SET error:', error);
    throw error;
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Redis GET error:', error);
    throw error;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Redis DEL error:', error);
    throw error;
  }
};

export default redisClient;
