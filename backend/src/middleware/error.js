import { errorResponse } from '../utils/apiResponse.js';

export const notFound = (req, res) =>
  errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);

export const errorHandler = (err, _req, res, _next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return errorResponse(res, Object.values(err.errors).map((error) => error.message).join(', '), 400);
  }

  if (err.code === 11000) {
    return errorResponse(res, 'A record with those details already exists', 409);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 ? (err.message || 'Request failed') : 'Internal server error';
  return errorResponse(res, message, statusCode);
};
