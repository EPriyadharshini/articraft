import express from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import User from '../models/User.js';
import Artist from '../models/Artist.js';
import { config } from '../config/env.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

const router = express.Router();

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['CUSTOMER', 'ARTIST']).withMessage('Role must be CUSTOMER or ARTIST'),
  handleValidationErrors,
];

const credentialsValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, config.jwtSecret, { expiresIn: '7d' });

const publicUser = (user) => user.toJSON();

router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const { name, email, password, role = 'CUSTOMER' } = req.body;
    const user = await User.create({ name, email, password, role });

    if (role === 'ARTIST') {
      await Artist.create({ user: user._id });
    }

    return successResponse(res, { token: signToken(user), user: publicUser(user) }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
});

router.post('/login', credentialsValidation, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');

    if (!user || !user.isActive || !(await user.comparePassword(req.body.password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    return successResponse(res, { token: signToken(user), user: publicUser(user) }, 'Login successful');
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, async (req, res) => successResponse(res, { user: publicUser(req.user) }));

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('A valid email is required'), handleValidationErrors],
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select('+resetPasswordToken +resetPasswordExpires');
      const message = 'If an account exists for that email, a reset link has been generated.';

      if (!user) {
        return successResponse(res, null, message);
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      return successResponse(res, process.env.NODE_ENV === 'production' ? null : { resetToken: rawToken }, message);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'), handleValidationErrors],
  async (req, res, next) => {
    try {
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+resetPasswordToken +resetPasswordExpires');

      if (!user) {
        return errorResponse(res, 'Reset token is invalid or expired', 400);
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return successResponse(res, { token: signToken(user), user: publicUser(user) }, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
