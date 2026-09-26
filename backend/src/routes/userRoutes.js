import express from 'express';
import { body } from 'express-validator';
import Artist from '../models/Artist.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

const router = express.Router();

const artistProfile = (artist) => {
  const item = artist.toObject ? artist.toObject() : artist;
  const { _id, user, followers, ...profile } = item;
  return {
    ...profile,
    id: _id,
    name: user?.name || '',
    avatar: user?.avatar || '',
    followerCount: followers?.length || 0,
  };
};

router.get('/artists', async (_req, res, next) => {
  try {
    const artists = await Artist.find().populate('user', 'name avatar').sort({ rating: -1 });
    const counts = await Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$artist', count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((item) => [item._id.toString(), item.count]));
    return successResponse(res, {
      artists: artists.map((artist) => ({ ...artistProfile(artist), productCount: countMap.get(artist._id.toString()) || 0 })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/artists/me/stats', protect, authorize('ARTIST'), async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) return errorResponse(res, 'Artist profile not found', 404);
    const [productStats, salesStats, salesOverTime, bestSellers] = await Promise.all([
      Product.aggregate([{ $match: { artist: artist._id, isActive: true } }, { $group: { _id: null, products: { $sum: 1 }, sold: { $sum: '$soldCount' } } }]),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', 'sellerOrders.artist': artist._id } },
        { $unwind: '$sellerOrders' },
        { $match: { 'sellerOrders.artist': artist._id, 'sellerOrders.status': { $ne: 'Cancelled' } } },
        { $group: { _id: null, earnings: { $sum: '$sellerOrders.subtotal' }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', 'sellerOrders.artist': artist._id } },
        { $unwind: '$sellerOrders' },
        { $match: { 'sellerOrders.artist': artist._id, 'sellerOrders.status': { $ne: 'Cancelled' } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, earnings: { $sum: '$sellerOrders.subtotal' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ artist: artist._id, isActive: true }).sort({ soldCount: -1 }).limit(5).select('name price soldCount rating'),
    ]);
    return successResponse(res, {
      stats: {
        products: productStats[0]?.products || 0,
        sold: productStats[0]?.sold || 0,
        earnings: salesStats[0]?.earnings || 0,
        orders: salesStats[0]?.orders || 0,
        salesOverTime,
        bestSellers,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/artists/:id', async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user', 'name avatar');
    if (!artist) return errorResponse(res, 'Artist not found', 404);
    const products = await Product.find({ artist: artist._id, isActive: true }).populate('category', 'name slug').sort({ createdAt: -1 });
    return successResponse(res, {
      artist: { ...artistProfile(artist), productCount: products.length },
      products: products.map((product) => ({ ...product.toObject(), id: product._id, reviews: product.reviewCount || 0, images: product.images.map((image) => image.url) })),
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/artists/me',
  protect,
  authorize('ARTIST'),
  [
    body('bio').optional().trim().isLength({ max: 2000 }).withMessage('Bio is too long'),
    body('location').optional().trim().isLength({ max: 120 }).withMessage('Location is too long'),
    body('specialization').optional().trim().isLength({ max: 120 }).withMessage('Specialization is too long'),
    body('socials').optional().isObject().withMessage('Social links must be an object'),
    body('socials.instagram').optional().trim().isLength({ max: 120 }).withMessage('Instagram link is too long'),
    body('socials.website').optional().trim().isLength({ max: 200 }).withMessage('Website link is too long'),
    body('socials.facebook').optional().trim().isLength({ max: 200 }).withMessage('Facebook link is too long'),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const updates = ['bio', 'location', 'specialization', 'socials'].reduce((result, field) => {
        if (req.body[field] !== undefined) result[field] = req.body[field];
        return result;
      }, {});
      const artist = await Artist.findOneAndUpdate({ user: req.user._id }, { $set: updates }, { new: true, runValidators: true }).populate('user', 'name avatar');
      if (!artist) return errorResponse(res, 'Artist profile not found', 404);
      return successResponse(res, { artist: artistProfile(artist) }, 'Artist profile updated');
    } catch (error) {
      next(error);
    }
  }
);

router.post('/artists/:id/follow', protect, authorize('CUSTOMER'), async (req, res, next) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } }, { new: true });
    if (!artist) return errorResponse(res, 'Artist not found', 404);
    return successResponse(res, { following: true, followerCount: artist.followers.length }, 'Artist followed');
  } catch (error) {
    next(error);
  }
});

router.delete('/artists/:id/follow', protect, authorize('CUSTOMER'), async (req, res, next) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } }, { new: true });
    if (!artist) return errorResponse(res, 'Artist not found', 404);
    return successResponse(res, { following: false, followerCount: artist.followers.length }, 'Artist unfollowed');
  } catch (error) {
    next(error);
  }
});

export default router;
