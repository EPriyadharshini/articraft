import express from 'express';
import { body } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

const router = express.Router();
router.use(protect, authorize('CUSTOMER'));

const populateCart = (cart) => cart.populate({
  path: 'items.product',
  match: { isActive: true },
  populate: [{ path: 'artist', populate: { path: 'user', select: 'name avatar' } }, { path: 'category', select: 'name slug' }],
});

router.get('/', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return successResponse(res, { cart: { items: [] } });
    await populateCart(cart);
    return successResponse(res, { cart });
  } catch (error) {
    next(error);
  }
});

router.post('/items', [
  body('productId').isMongoId().withMessage('A valid product is required'),
  body('quantity').optional().isInt({ min: 1 }).toInt(),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.body.productId, isActive: true });
    if (!product) return errorResponse(res, 'Product not found', 404);
    const quantity = req.body.quantity || 1;
    const currentCart = await Cart.findOne({ user: req.user._id });
    const currentItem = currentCart?.items.find((item) => item.product.toString() === product._id.toString());
    if ((currentItem?.quantity || 0) + quantity > product.stock) {
      return errorResponse(res, `Only ${product.stock} item(s) are available`, 409);
    }
    const existing = await Cart.findOneAndUpdate(
      { user: req.user._id, 'items.product': product._id },
      { $inc: { 'items.$.quantity': quantity } },
      { new: true }
    );
    const cart = existing || await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id }, $push: { items: { product: product._id, quantity } } },
      { new: true, upsert: true }
    );
    await populateCart(cart);
    return successResponse(res, { cart }, 'Cart updated');
  } catch (error) {
    next(error);
  }
});

router.patch('/items/:productId', [
  body('quantity').isInt({ min: 1 }).toInt().withMessage('Quantity must be at least 1'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, isActive: true });
    if (!product) return errorResponse(res, 'Product not found', 404);
    if (req.body.quantity > product.stock) return errorResponse(res, `Only ${product.stock} item(s) are available`, 409);
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id, 'items.product': req.params.productId },
      { $set: { 'items.$.quantity': req.body.quantity } },
      { new: true }
    );
    if (!cart) return errorResponse(res, 'Cart item not found', 404);
    await populateCart(cart);
    return successResponse(res, { cart }, 'Cart updated');
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:productId', async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { product: req.params.productId } } },
      { new: true }
    );
    if (cart) await populateCart(cart);
    return successResponse(res, { cart: cart || { items: [] } }, 'Cart updated');
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { upsert: true });
    return successResponse(res, { cart: { items: [] } }, 'Cart cleared');
  } catch (error) {
    next(error);
  }
});

export default router;
