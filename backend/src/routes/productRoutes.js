import express from 'express';
import { body, query } from 'express-validator';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Artist from '../models/Artist.js';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';
import { handleUploadError, productImagesUpload } from '../middleware/upload.js';
import { deleteImage, uploadImage } from '../utils/cloudinary.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

const router = express.Router();

const productPopulate = [
  { path: 'artist', populate: { path: 'user', select: 'name avatar' } },
  { path: 'category', select: 'name slug' },
];

const serializeProduct = (product) => {
  const item = product.toObject ? product.toObject() : product;
  return {
    ...item,
    id: item._id,
    artistId: item.artist?._id || item.artist,
    artist: item.artist?.user?.name || item.artist?.name || '',
    category: item.category?.name || item.category || '',
    reviews: item.reviewCount || 0,
    images: (item.images || []).map((image) => (typeof image === 'string' ? image : image.url)),
  };
};

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const parseTags = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : String(value).split(',');
  } catch {
    return String(value).split(',');
  }
};

const validateProduct = [
  body('name').trim().isLength({ min: 2, max: 160 }).withMessage('Name must be between 2 and 160 characters'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('material').trim().notEmpty().withMessage('Material is required'),
  body('category').isMongoId().withMessage('A valid category is required'),
  handleValidationErrors,
];

const validateProductUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 160 }).withMessage('Name must be between 2 and 160 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('material').optional().trim().notEmpty().withMessage('Material is required'),
  body('category').optional().isMongoId().withMessage('A valid category is required'),
  handleValidationErrors,
];

const findArtistForUser = (userId) => Artist.findOne({ user: userId });

const canManageProduct = (user, product) =>
  user.role === 'ADMIN' || (user.role === 'ARTIST' && product.artist?.user?._id?.toString() === user._id.toString());

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { search, category, material, sort = 'newest' } = req.query;
      const page = req.query.page || 1;
      const limit = req.query.limit || 12;
      const filter = { isActive: true };

      if (search) filter.$text = { $search: String(search) };
      if (category && category !== 'All') {
        const categoryConditions = [{ slug: String(category).toLowerCase() }, { name: category }];
        if (mongoose.isValidObjectId(category)) categoryConditions.unshift({ _id: category });
        const categoryRecord = await Category.findOne({ $or: categoryConditions });
        if (!categoryRecord) return successResponse(res, { products: [], categories: [], pagination: { page, limit, total: 0, pages: 0 } });
        filter.category = categoryRecord._id;
      }
      if (material) filter.material = new RegExp(String(material), 'i');
      if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
        filter.price = {};
        if (req.query.minPrice !== undefined) filter.price.$gte = req.query.minPrice;
        if (req.query.maxPrice !== undefined) filter.price.$lte = req.query.maxPrice;
      }

      const sortMap = {
        newest: { createdAt: -1 },
        'price-low': { price: 1 },
        'price-high': { price: -1 },
        popular: { soldCount: -1 },
        rating: { rating: -1 },
      };
      const [products, total, categories] = await Promise.all([
        Product.find(filter).populate(productPopulate).sort(sortMap[sort] || sortMap.newest).skip((page - 1) * limit).limit(limit),
        Product.countDocuments(filter),
        Category.find({ isActive: true }).sort({ name: 1 }).select('name slug'),
      ]);

      return successResponse(res, {
        products: products.map(serializeProduct),
        categories: ['All', ...categories.map((item) => item.name)],
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/featured', async (_req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).populate(productPopulate).sort({ rating: -1, soldCount: -1 }).limit(8);
    return successResponse(res, { products: products.map(serializeProduct) });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).select('name slug description image');
    return successResponse(res, { categories: ['All', ...categories.map((item) => item.name)], records: categories });
  } catch (error) {
    next(error);
  }
});

router.get('/mine', protect, authorize('ARTIST'), async (req, res, next) => {
  try {
    const artist = await findArtistForUser(req.user._id);
    if (!artist) return errorResponse(res, 'Artist profile not found', 404);
    const products = await Product.find({ artist: artist._id }).populate(productPopulate).sort({ createdAt: -1 });
    return successResponse(res, { products: products.map(serializeProduct) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const filter = mongoose.isValidObjectId(req.params.id) ? { _id: req.params.id } : { slug: req.params.id };
    const product = await Product.findOne({ ...filter, isActive: true }).populate(productPopulate);
    if (!product) return errorResponse(res, 'Product not found', 404);

    const related = await Product.find({ category: product.category._id, _id: { $ne: product._id }, isActive: true })
      .populate(productPopulate)
      .sort({ rating: -1 })
      .limit(3);
    return successResponse(res, { product: serializeProduct(product), related: related.map(serializeProduct) });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, authorize('ARTIST', 'ADMIN'), productImagesUpload, handleUploadError, validateProduct, async (req, res, next) => {
  try {
    const artist = req.user.role === 'ADMIN' && req.body.artist ? await Artist.findById(req.body.artist) : await findArtistForUser(req.user._id);
    if (!artist) return errorResponse(res, 'Artist profile not found', 404);

    const images = await Promise.all((req.files || []).map(uploadImage));
    const product = await Product.create({
      artist: artist._id,
      name: req.body.name,
      slug: `${slugify(req.body.name)}-${Date.now()}`,
      description: req.body.description,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      category: req.body.category,
      material: req.body.material,
      dimensions: req.body.dimensions,
      tags: parseTags(req.body.tags),
      images,
    });

    await product.populate(productPopulate);
    return successResponse(res, { product: serializeProduct(product) }, 'Product created', 201);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, authorize('ARTIST', 'ADMIN'), productImagesUpload, handleUploadError, validateProductUpdate, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate({ path: 'artist', populate: { path: 'user' } });
    if (!product) return errorResponse(res, 'Product not found', 404);
    if (!canManageProduct(req.user, product)) return errorResponse(res, 'You can only manage your own products', 403);

    const nextImages = await Promise.all((req.files || []).map(uploadImage));
    if (nextImages.length) product.images.push(...nextImages);
    const allowedFields = ['name', 'description', 'price', 'stock', 'category', 'material', 'dimensions'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = ['price', 'stock'].includes(field) ? Number(req.body[field]) : req.body[field];
    });
    if (req.body.tags !== undefined) product.tags = parseTags(req.body.tags);
    if (req.body.isActive !== undefined && req.user.role === 'ADMIN') product.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    await product.save();
    await product.populate(productPopulate);
    return successResponse(res, { product: serializeProduct(product) }, 'Product updated');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, authorize('ARTIST', 'ADMIN'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "artist",
      populate: { path: "user" },
    });
    if (!product) return errorResponse(res, "Product not found", 404);
    if (!canManageProduct(req.user, product))
      return errorResponse(res, "You can only manage your own products", 403);
    // Delete images from Cloudinary
    for (const image of product.images || []) {
      if (image.publicId) {
        await deleteImage(image.publicId);
      }
    }

    // Permanently delete product from MongoDB
    await Product.findByIdAndDelete(req.params.id);

    return successResponse(res, null, "Product permanently deleted");
  } catch (error) {
    next(error);
  }
});

export default router;
