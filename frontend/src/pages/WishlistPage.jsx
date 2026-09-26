import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatINR } from '../utils/currency';


export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useAppContext();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!wishlist.length) {
        setProducts([]);
        return;
      }

      try {
        const response = await api.get('/wishlist');
        const saved = response.data.data.wishlist.products || [];
        setProducts(saved.map((product) => ({
          ...product,
          id: product._id,
          images: (product.images || []).map((image) => (typeof image === 'string' ? image : image.url)),
          artist: product.artist?.user?.name || product.artist?.name || '',
        })));
      } catch (error) {
        console.error('Error loading wishlist', error);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (!wishlist.length) {
    return (
      <div className="section-shell py-12">
        <h1 className="font-display text-5xl text-forest">Your wishlist</h1>
        <div className="mt-8 rounded-[2rem] border border-dashed border-stone-300 bg-white p-8 text-slate-500">
          You have no saved products yet. Explore the marketplace and add pieces you love.
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Saved pieces</p>
          <h1 className="mt-3 font-display text-5xl text-forest">Your wishlist</h1>
        </div>
        <div className="text-sm text-slate-600">{products.length} saved</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-soft">
            <Link to={`/product/${product.slug || product.id}`}>
              <img src={product.images?.[0]} alt={product.name} className="h-72 w-full object-cover" />
            </Link>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{product.category}</span>
                <button onClick={() => toggleWishlist(product.id)} className="rounded-full bg-clay p-2 text-white" aria-label={`Remove ${product.name} from wishlist`}>
                  <Heart size={15} fill="currentColor" />
                </button>
              </div>
              <Link to={`/product/${product.slug || product.id}`} className="mt-4 block text-2xl font-semibold text-slate-800 hover:text-forest">
                {product.name}
              </Link>
              <p className="mt-1 text-sm text-slate-500">by {product.artist}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="text-2xl font-bold text-forest">{formatINR(product.price)}</div>
                <div className="flex items-center gap-2">
                  <button disabled={product.stock <= 0} onClick={() => addToCart(product).catch(() => {})} className="flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
                    <ShoppingBag size={15} />
                    {product.stock <= 0 ? 'Out of stock' : 'Add to Cart'}
                  </button>
                  <button onClick={() => toggleWishlist(product.id)} className="rounded-full border border-stone-300 p-2 text-slate-600 hover:text-rose-600" aria-label={`Delete ${product.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
