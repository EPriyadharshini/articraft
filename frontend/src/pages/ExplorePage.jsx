import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';


export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q !== null) setSearchTerm(q);
    const s = searchParams.get('sort');
    if (s) setSortBy(s);
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: {
          category: selectedCategory,
          search: searchTerm,
          sort: sortBy,
        },
      });
      setProducts(response.data.data.products || []);
      setCategories(response.data.data.categories || ['All']);
    } catch (error) {
      console.error('Error loading products', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (category && category !== 'All') next.set('category', category);
      else next.delete('category');
      return next;
    });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      return next;
    });
  };

  return (
    <div className="section-shell py-12">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-500 dark:text-blue-400">Marketplace</p>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="font-display text-4xl sm:text-5xl text-forest dark:text-slate-100">Discover handmade treasures</h1>
          {searchTerm && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>Showing results for <span className="font-semibold text-slate-900 dark:text-white">"{searchTerm}"</span></span>
              <button
                onClick={handleClearSearch}
                className="text-xs font-semibold text-forest underline hover:opacity-80 dark:text-blue-400"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2.5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCategory === category
                ? 'bg-forest text-white shadow-soft'
                : 'bg-white text-slate-700 ring-1 ring-stone-200 hover:text-forest dark:bg-[#0b0d16] dark:text-slate-300 dark:ring-stone-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">{products.length} {products.length === 1 ? 'item' : 'items'} available</p>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="sr-only">Sort products</span><select aria-label="Sort products" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-forest dark:border-stone-700 dark:bg-[#0b0d16] dark:text-slate-200">
          <option value="newest">Newest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="popular">Popular</option>
          <option value="rating">Rating</option>
        </select></label>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
