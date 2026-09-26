export const successResponse = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

export const errorResponse = (res, message, statusCode = 500, data = null) =>
  res.status(statusCode).json({ success: false, data, message });
