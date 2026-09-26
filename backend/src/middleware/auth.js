import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const decoded = jwt.verify(header.slice(7), config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user || !user.isActive) {
      return errorResponse(res, 'User account is unavailable', 401);
    }

    req.user = user;
    next();
  } catch (_error) {
    return errorResponse(res, 'Invalid or expired authentication token', 401);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return errorResponse(res, 'You do not have permission to perform this action', 403);
  }

  next();
};
