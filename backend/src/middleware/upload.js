import multer from 'multer';
import { errorResponse } from '../utils/apiResponse.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(new Error('Only JPG, PNG, and WEBP images are allowed'));
  }

  callback(null, true);
};

export const productImagesUpload = multer({
  storage,
  fileFilter,
  limits: { files: 6, fileSize: 5 * 1024 * 1024 },
}).array('images', 6);

export const handleUploadError = (error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    return errorResponse(res, error.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5MB or smaller' : error.message, 400);
  }

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  next();
};
