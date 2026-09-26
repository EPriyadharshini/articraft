import Product from '../models/Product.js';
import Artist from '../models/Artist.js';
import Review from '../models/Review.js';

export const recomputeRatings = async ({ productId, artistId }) => {
  if (productId) {
    const [productStats] = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: '$product', rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    await Product.findByIdAndUpdate(productId, {
      rating: Number((productStats?.rating || 0).toFixed(2)),
      reviewCount: productStats?.reviewCount || 0,
    });
  }

  if (artistId) {
    const [artistStats] = await Review.aggregate([
      { $match: { artist: artistId } },
      { $group: { _id: '$artist', rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    await Artist.findByIdAndUpdate(artistId, {
      rating: Number((artistStats?.rating || 0).toFixed(2)),
      reviewCount: artistStats?.reviewCount || 0,
    });
  }
};
