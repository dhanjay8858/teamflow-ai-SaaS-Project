import multer from 'multer';
import { AppError } from '../utils/appError.js';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../services/cloudinary.service.js';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type "${file.mimetype}" is not allowed`, 400));
  }
};

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
}).single('file');
