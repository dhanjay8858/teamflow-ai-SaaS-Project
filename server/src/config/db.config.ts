import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

// Force Node.js DNS resolver to prioritize IPv4 (fixes Render cloud IPv6 timeout issues)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in older node environments
}

const getFormattedUri = (uri: string): string => {
  let formatted = uri.trim();
  if (formatted.startsWith('mongodb+srv://') && !formatted.includes('?')) {
    formatted += '?retryWrites=true&w=majority';
  }
  return formatted;
};

export let mongoAuthError = false;

export const connectDatabase = async (retries = 3, delayMs = 2000): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;

  try {
    mongoose.set('strictQuery', true);

    if (!mongoose.connection.listeners('connected').length) {
      mongoose.connection.on('connected', () => {
        mongoAuthError = false;
        logger.info('🟢 MongoDB connection established successfully');
      });

      mongoose.connection.on('error', (err: any) => {
        if (err?.message?.includes('bad auth') || err?.code === 8000) {
          mongoAuthError = true;
          logger.error('❌ MongoDB Atlas Authentication Failed: Incorrect database username or password.');
        } else {
          logger.error('🔴 MongoDB connection error:', err);
        }
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('🟡 MongoDB disconnected');
      });
    }

    const uri = getFormattedUri(env.MONGODB_URI);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });
    mongoAuthError = false;
  } catch (error: any) {
    if (error?.message?.includes('bad auth') || error?.code === 8000 || error?.errorResponse?.code === 8000) {
      mongoAuthError = true;
      logger.error('❌ MongoDB Atlas Authentication Failed: Bad auth. Please reset your database user password in MongoDB Atlas -> Database Access and update MONGODB_URI.');
      return; // Do not retry if credentials are wrong
    }

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
