import multer from 'multer';
import { AppError } from '../utils/appError.js';

const storage = multer.memoryStorage();

const avatarFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpeg, png, webp, gif) are allowed for profile avatars', 400));
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max avatar image size
  },
}).single('avatar');
