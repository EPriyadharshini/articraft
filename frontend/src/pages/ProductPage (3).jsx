import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { Star, ShoppingBag, Heart, Truck, ShieldCheck, PackageCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatINR } from '../utils/currency';
import ShareButton from '../components/ShareButton';


export default function ProductPage() {
  const { productId } = useParams();
  const { addToCart, toggleWishlist, wishlist, user } = useAppContext();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data.data.product);
        setRelated(response.data.data.related || []);
        const reviewResponse = await api.get(`/reviews/product/${response.data.data.product._id || response.data.data.product.id}`);
        setReviews(reviewResponse.data.data.reviews || []);
        if (user?.role === 'CUSTOMER') {
          const eligibilityResponse = await api.get(`/reviews/product/${response.data.data.product._id || response.data.data.product.id}/eligibility`);
          setCanReview(eligibilityResponse.data.data.eligible);
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load this product.');
      }
    };

    load();
  }, [productId, user?.role]);

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post(`/reviews/product/${product._id || product.id}`, review);
      setReviewMessage('Thank you for sharing your experience.');
      setReview({ rating: 5, comment: '' });
      setReviews((current) => [response.data.data.review, ...current]);
    } catch (error) {
      setReviewMessage(error.response?.data?.message || 'You can review this product after delivery.');
    }
  };

  if (error) {
    return <div className="section-shell py-12"><h1 className="font-display text-4xl text-forest">Product unavailable</h1><p role="alert" className="mt-5 text-lg text-slate-600">{error}</p><Link to="/explore" className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 font-medium text-white">Browse the marketplace</Link></div>;
  }

  if (!product) {
    return <div className="section-shell py-12 text-lg text-slate-600">Loading product...</div>;
  }

  return (
    <div className="section-shell py-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <img src={product.images?.[0]} alt={product.name} className="h-[620px] w-full rounded-[2rem] object-cover shadow-soft" />
          <div className="mt-5 grid grid-cols-2 gap-4">
            {product.images?.slice(1).map((image, index) => (
              <img key={index} src={image} alt={`${product.name} view ${index + 2}`} className="h-52 w-full rounded-[1.5rem] object-cover" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{product.category}</div>
          <h1 className="font-display text-5xl text-forest">{product.name}</h1>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1 text-amber-600"><Star size={15} fill="currentColor" /> {product.rating}</span>
            <span>({product.reviewCount ?? product.reviews ?? 0} reviews)</span>
          </div>

          <div className="text-4xl font-bold text-forest">{formatINR(product.price)}</div>

          <p className="text-lg leading-8 text-slate-600">{product.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <button disabled={product.stock <= 0} onClick={() => addToCart(product).catch(() => {})} className="glow-btn flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
              <span className="glow-blob" />
              <span className="glow-inner flex items-center gap-2">
                <ShoppingBag size={18} />
                {product.stock <= 0 ? 'Out of stock' : 'Add to Cart'}
              </span>
            </button>
            <button onClick={() => toggleWishlist(product.id)} aria-label={`${wishlist.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlist.includes(product.id) ? 'from' : 'to'} wishlist`} className={`flex items-center gap-2 rounded-full border px-6 py-3 font-medium ${wishlist.includes(product.id) ? 'border-clay bg-clay text-white' : 'border-stone-300 bg-white text-slate-700'}`}>
              <Heart size={18} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
              Add to wishlist
            </button>
            <ShareButton title={product.name} />
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between text-sm text-slate-600"><span>Made by</span> <Link to={`/artist/${product.artistId || 'user-1'}`} className="font-semibold text-forest">{product.artist}</Link></div>
            <div className="flex items-center justify-between text-sm text-slate-600"><span>Materials</span> <span>{product.material}</span></div>
            <div className="flex items-center justify-between text-sm text-slate-600"><span>Dimensions</span> <span>{product.dimensions}</span></div>
            <div className="flex items-center justify-between text-sm text-slate-600"><span>Stock</span> <span>{product.stock} available</span></div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <Truck className="text-forest" size={22} />
              <p className="mt-3 font-medium text-slate-800">Shipping</p>
              <p className="text-sm text-slate-500">Free delivery over {formatINR(120)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <PackageCheck className="text-forest" size={22} />
              <p className="mt-3 font-medium text-slate-800">Handmade</p>
              <p className="text-sm text-slate-500">See the product description for details from the artist</p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <ShieldCheck className="text-forest" size={22} />
              <p className="mt-3 font-medium text-slate-800">Order support</p>
              <p className="text-sm text-slate-500">Checkout is processed through Razorpay</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <section>
            <h2 className="font-display text-4xl text-forest">Reviews</h2>
            <div className="mt-6 space-y-3">
              {reviews.length ? reviews.map((item) => (
                <div key={item._id} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex justify-between gap-3"><span className="font-medium text-slate-800">{item.user?.name || 'Customer'}</span><span className="text-amber-600">★ {item.rating}</span></div>
                  <p className="mt-2 text-slate-600">{item.comment}</p>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-slate-500">No reviews yet.</div>}
            </div>
          </section>
          {user?.role === 'CUSTOMER' && canReview && (
            <form onSubmit={submitReview} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-soft">
              <h3 className="text-xl font-semibold text-slate-800">Leave a review</h3>
              <label htmlFor="review-rating" className="sr-only">Rating</label>
              <select id="review-rating" value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })} className="mt-4 w-full rounded-xl border border-stone-300 px-3 py-2">
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
              <label htmlFor="review-comment" className="sr-only">Review comment</label>
              <textarea id="review-comment" required minLength={3} value={review.comment} onChange={(event) => setReview({ ...review, comment: event.target.value })} placeholder="Tell other collectors about this piece" className="mt-3 w-full rounded-xl border border-stone-300 p-3" rows={4} />
              <p className="mt-3 text-sm leading-6 text-slate-600">Your name and review may be displayed with this product. See the <Link to="/privacy" className="text-forest underline">Privacy Policy</Link>.</p>
              {reviewMessage && <p role="status" className="mt-3 text-sm text-slate-600">{reviewMessage}</p>}
              <button className="mt-4 rounded-full bg-forest px-4 py-2 text-sm font-medium text-white">Submit review</button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-4xl text-forest">Related pieces</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {related.map((item) => (
            <Link key={item.id} to={`/product/${item.id}`} className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-soft">
              <img src={item.images?.[0]} alt={item.name} className="h-64 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{item.category}</span>
                  <span className="flex items-center gap-1 text-amber-600"><Star size={14} fill="currentColor" /> {item.rating}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-800">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-500">by {item.artist}</p>
                <div className="mt-4 text-2xl font-bold text-forest">{formatINR(item.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
