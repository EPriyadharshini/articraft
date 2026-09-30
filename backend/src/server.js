import "dotenv/config";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { config, validateEnvironment } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes, { razorpayWebhook } from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { successResponse } from './utils/apiResponse.js';
import { testCloudinary } from "./utils/cloudinary.js";

validateEnvironment();

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('combined'));

app.get('/api/health', (_req, res) => successResponse(res, { service: 'articraft-api', status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);
await testCloudinary();
const start = async () => {
  await connectDB();
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
};

start().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

export default app;
