import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
      logger.info('🟢 MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('🔴 MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('🟡 MongoDB disconnected');
    });

    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    logger.error('❌ Database connection failure:', error);
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
