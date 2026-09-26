import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

const router = express.Router();
router.use(protect, authorize('ADMIN'));

router.get('/stats', async (_req, res, next) => {
  try {
    const [users, artists, products, orders, revenue] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ARTIST' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    return successResponse(res, {
      stats: { users, artists, products, orders, revenue: revenue[0]?.total || 0 },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const filter = req.query.role ? { role: req.query.role } : {};
    const [users, total] = await Promise.all([
      User.find(filter).select('-password -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    return successResponse(res, { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { user }, 'User status updated');
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, null, 'Product removed');
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    return successResponse(res, { categories: await Category.find().sort({ name: 1 }) });
  } catch (error) {
    next(error);
  }
});

router.post('/categories', [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Category name is required'),
  body('slug').optional().trim().isLength({ min: 2, max: 80 }),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name: req.body.name, slug, description: req.body.description, image: req.body.image });
    return successResponse(res, { category }, 'Category created', 201);
  } catch (error) {
    next(error);
  }
});

router.patch('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, { category }, 'Category updated');
  } catch (error) {
    next(error);
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, null, 'Category removed');
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const [orders, total] = await Promise.all([
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Order.countDocuments(),
    ]);
    return successResponse(res, { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.get('/revenue', async (req, res, next) => {
  try {
    const since = new Date(req.query.from || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return successResponse(res, { revenue });
  } catch (error) {
    next(error);
  }
});

export default router;
