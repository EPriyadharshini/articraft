import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

const router = express.Router();
router.use(protect, authorize('CUSTOMER'));

router.get('/', async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      match: { isActive: true },
      populate: [{ path: 'artist', populate: { path: 'user', select: 'name avatar' } }, { path: 'category', select: 'name slug' }],
    });
    return successResponse(res, { wishlist: wishlist || { products: [] } });
  } catch (error) {
    next(error);
  }
});

router.post('/:productId', async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, isActive: true });
    if (!product) return errorResponse(res, 'Product not found', 404);
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id }, $addToSet: { products: product._id } },
      { new: true, upsert: true }
    ).populate('products');
    return successResponse(res, { wishlist }, 'Product added to wishlist');
  } catch (error) {
    next(error);
  }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: req.params.productId } },
      { new: true }
    );
    return successResponse(res, { wishlist: wishlist || { products: [] } }, 'Product removed from wishlist');
  } catch (error) {
    next(error);
  }
});

export default router;
