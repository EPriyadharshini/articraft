import express from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Artist from '../models/Artist.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

const router = express.Router();
const statusTransitions = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

const totalsFor = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 120 ? 0 : 12;
  const tax = Number((subtotal * 0.08).toFixed(2));
  return { subtotal, shippingFee, tax, total: Number((subtotal + shippingFee + tax).toFixed(2)) };
};

const orderData = (order) => order.toObject();

const requestError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const finalizePayment = async ({ razorpayOrderId, razorpayPaymentId, userId, expectedAmount }) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const filter = { razorpayOrderId };
    if (userId) filter.user = userId;
    const order = await Order.findOne(filter).session(session);
    if (!order) throw requestError('Order not found', 404);
    if (order.paymentStatus === 'Paid') {
      await session.abortTransaction();
      return order;
    }
    if (order.paymentStatus !== 'Pending') throw requestError('Order can no longer be paid', 409);
    if (expectedAmount !== undefined && Math.round(order.total * 100) !== expectedAmount) {
      throw requestError('Payment amount does not match the order', 400);
    }

    for (const item of order.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
        { new: true, session }
      );
      if (!updated) throw requestError(`Insufficient stock for ${item.name}`, 409);
    }

    order.paymentStatus = 'Paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save({ session });
    await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } }, { session });
    await session.commitTransaction();
    return order;
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    if (!webhookSecret) return errorResponse(res, 'Webhook endpoint is not configured', 503);
    if (!signature || !Buffer.isBuffer(req.body)) return errorResponse(res, 'Invalid webhook request', 400);

    const expected = crypto.createHmac('sha256', webhookSecret).update(req.body).digest('hex');
    if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return errorResponse(res, 'Invalid webhook signature', 400);
    }

    const payload = JSON.parse(req.body.toString('utf8'));
    if (!['payment.captured', 'order.paid'].includes(payload.event)) return successResponse(res, null, 'Webhook ignored');
    const payment = payload.payload?.payment?.entity;
    if (!payment?.order_id || !payment.id || payment.status !== 'captured') {
      return errorResponse(res, 'Webhook payment details are incomplete', 400);
    }

    const order = await finalizePayment({ razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, expectedAmount: payment.amount });
    return successResponse(res, { order: orderData(order) }, 'Webhook payment processed');
  } catch (error) {
    next(error);
  }
};

router.get('/my-orders', protect, authorize('CUSTOMER'), async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, { orders: orders.map(orderData) });
  } catch (error) {
    next(error);
  }
});

router.post('/checkout', protect, authorize('CUSTOMER'), [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Recipient name is required'),
  body('shippingAddress.line1').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  handleValidationErrors,
], async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      match: { isActive: true },
      populate: { path: 'artist' },
    });
    if (!cart || !cart.items.length || cart.items.some((item) => !item.product)) {
      return errorResponse(res, 'Cart is empty or contains unavailable products', 400);
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      artist: item.product.artist._id,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      quantity: item.quantity,
      price: item.product.price,
    }));
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) return errorResponse(res, `Insufficient stock for ${item.product.name}`, 409);
    }

    const sellers = new Map();
    items.forEach((item) => {
      const seller = sellers.get(item.artist.toString()) || { artist: item.artist, items: [], subtotal: 0 };
      seller.items.push(item);
      seller.subtotal += item.price * item.quantity;
      sellers.set(item.artist.toString(), seller);
    });
    const totals = totalsFor(items);
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totals.total * 100),
      currency: 'INR',
      receipt: `articraft_${Date.now()}`,
    });

    session.startTransaction();
    const [order] = await Order.create([{
      user: req.user._id,
      items,
      sellerOrders: Array.from(sellers.values()),
      shippingAddress: req.body.shippingAddress,
      ...totals,
      razorpayOrderId: razorpayOrder.id,
    }], { session });
    await session.commitTransaction();
    return successResponse(res, { order: orderData(order), razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID }, 'Checkout created', 201);
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
});

router.post('/verify', protect, authorize('CUSTOMER'), [
  body('razorpayOrderId').trim().notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').trim().notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').trim().notEmpty().withMessage('Razorpay signature is required'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay is not configured');
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    const validSignature = expected.length === razorpaySignature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpaySignature));
    if (!validSignature) return errorResponse(res, 'Invalid payment signature', 400);

    const order = await finalizePayment({ razorpayOrderId, razorpayPaymentId, userId: req.user._id });
    if (!order.razorpaySignature) {
      order.razorpaySignature = razorpaySignature;
      await order.save();
    }
    return successResponse(res, { order: orderData(order) }, 'Payment verified');
  } catch (error) {
    next(error);
  }
});

router.post('/payment-failed', protect, authorize('CUSTOMER'), [
  body('razorpayOrderId').trim().notEmpty().withMessage('Razorpay order ID is required'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: req.body.razorpayOrderId, user: req.user._id, paymentStatus: 'Pending' },
      { $set: { paymentStatus: 'Failed' } },
      { new: true }
    );
    if (!order) return errorResponse(res, 'Pending order not found', 404);
    return successResponse(res, { order: orderData(order) }, 'Payment marked failed');
  } catch (error) {
    next(error);
  }
});

router.get('/artist', protect, authorize('ARTIST'), async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    if (!artist) return errorResponse(res, 'Artist profile not found', 404);
    const orders = await Order.find({ paymentStatus: 'Paid', 'sellerOrders.artist': artist._id }).sort({ createdAt: -1 });
    const sellerOrders = orders.flatMap((order) => order.sellerOrders
      .filter((sellerOrder) => sellerOrder.artist.toString() === artist._id.toString())
      .map((sellerOrder) => ({ ...sellerOrder.toObject(), orderId: order._id, paymentStatus: order.paymentStatus, createdAt: order.createdAt })));
    return successResponse(res, { orders: sellerOrders });
  } catch (error) {
    next(error);
  }
});

router.patch('/artist/:orderId/:sellerOrderId/status', protect, authorize('ARTIST'), [
  body('status').isIn(Object.keys(statusTransitions)).withMessage('Invalid status'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ user: req.user._id });
    const order = await Order.findOne({
      _id: req.params.orderId,
      paymentStatus: 'Paid',
      'sellerOrders._id': req.params.sellerOrderId,
      'sellerOrders.artist': artist?._id,
    });
    if (!order) return errorResponse(res, 'Seller order not found', 404);
    const sellerOrder = order.sellerOrders.id(req.params.sellerOrderId);
    if (!statusTransitions[sellerOrder.status].includes(req.body.status)) return errorResponse(res, 'Invalid order status transition', 400);
    sellerOrder.status = req.body.status;
    await order.save();
    return successResponse(res, { order: sellerOrder }, 'Order status updated');
  } catch (error) {
    next(error);
  }
});

export default router;
