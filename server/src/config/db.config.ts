import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (retries = 5, delayMs = 2000): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;

  try {
    mongoose.set('strictQuery', true);

    if (!mongoose.connection.listeners('connected').length) {
      mongoose.connection.on('connected', () => {
        logger.info('🟢 MongoDB connection established successfully');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('🔴 MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('🟡 MongoDB disconnected');
      });
    }

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
  } catch (error) {
    logger.error(`❌ Database connection failure (retries left: ${retries}):`, error);
    if (retries > 0) {
      logger.info(`🔄 Retrying MongoDB connection in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return connectDatabase(retries - 1, Math.round(delayMs * 1.5));
    }
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('🟢 MongoDB connection closed cleanly.');
  } catch (err) {
    logger.error('🔴 Error closing MongoDB connection:', err);
  }
};
