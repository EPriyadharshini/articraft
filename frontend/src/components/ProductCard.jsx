import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatINR } from '../utils/currency';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useAppContext();

  return (
    <div className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft transition hover:-translate-y-1">
      <div className="relative">
        <Link to={`/product/${product.slug || product.id}`}>
          <img src={product.images?.[0] || product.image} alt={product.name} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={`${wishlist.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlist.includes(product.id) ? 'from' : 'to'} wishlist`}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border ${
            wishlist.includes(product.id) ? 'bg-clay text-white border-clay' : 'bg-white/80 border-white/60 text-slate-700'
          }`}
        >
          <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{product.category}</div>
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <Star size={14} fill="currentColor" />
            {product.rating}
          </div>
        </div>

        <div>
          <Link to={`/product/${product.slug || product.id}`} className="text-xl font-semibold text-slate-800 hover:text-forest">
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-slate-500">By {product.artist}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-forest">{formatINR(product.price)}</div>
          <button
            onClick={() => addToCart(product).catch(() => {})}
            disabled={product.stock <= 0}
            className="flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingBag size={15} />
            {product.stock <= 0 ? 'Out of stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
