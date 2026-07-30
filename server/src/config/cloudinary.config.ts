import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

export const initCloudinary = (): void => {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    logger.info('☁️ Cloudinary SDK configured successfully');
  } else {
    logger.warn('⚠️ Cloudinary environment variables not set — file storage operating in fallback mode');
  }
};

export const uploadImage = async (buffer: Buffer, folder = 'teamflow'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

export { cloudinary };
