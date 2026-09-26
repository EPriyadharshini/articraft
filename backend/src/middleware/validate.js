import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array().map((error) => error.msg).join(', '), 422);
  }

  next();
};
