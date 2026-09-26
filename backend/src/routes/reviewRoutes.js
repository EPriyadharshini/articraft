import express from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';
import { recomputeRatings } from '../utils/ratings.js';

const router = express.Router();

router.get('/product/:productId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    return successResponse(res, { reviews });
  } catch (error) {
    next(error);
  }
});

router.get('/product/:productId/eligibility', protect, authorize('CUSTOMER'), async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, isActive: true }).select('_id');
    if (!product) return errorResponse(res, 'Product not found', 404);
    const [deliveredOrder, existingReview] = await Promise.all([
      Order.exists({ user: req.user._id, paymentStatus: 'Paid', sellerOrders: { $elemMatch: { status: 'Delivered', 'items.product': product._id } } }),
      Review.exists({ product: product._id, user: req.user._id }),
    ]);
    return successResponse(res, { eligible: Boolean(deliveredOrder) && !existingReview });
  } catch (error) {
    next(error);
  }
});

router.post('/product/:productId', protect, authorize('CUSTOMER'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 3, max: 2000 }).withMessage('Comment must be between 3 and 2000 characters'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, isActive: true });
    if (!product) return errorResponse(res, 'Product not found', 404);

    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      paymentStatus: 'Paid',
      sellerOrders: { $elemMatch: { status: 'Delivered', 'items.product': product._id } },
    });
    if (!deliveredOrder) return errorResponse(res, 'You can review a product after it has been delivered', 403);

    const existing = await Review.findOne({ product: product._id, user: req.user._id });
    if (existing) return errorResponse(res, 'You have already reviewed this product', 409);

    const review = await Review.create({
      product: product._id,
      artist: product.artist,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    await recomputeRatings({ productId: product._id, artistId: product.artist });
    await review.populate('user', 'name avatar');
    return successResponse(res, { review }, 'Review submitted', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
