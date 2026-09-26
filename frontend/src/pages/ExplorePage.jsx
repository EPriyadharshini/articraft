import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';


export default function ExplorePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  const handleSearch = (event) => {
    event.preventDefault();
    fetchProducts();
  };

  return (
    <div className="section-shell py-12">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Marketplace</p>
          <h1 className="mt-3 font-display text-5xl text-forest">Discover handmade treasures</h1>
        </div>
        <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-3">
          <label htmlFor="marketplace-search" className="sr-only">Search the marketplace</label>
          <input
            id="marketplace-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by product, maker, or style"
            className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 outline-none ring-0 transition focus:border-forest"
          />
          <button type="submit" className="rounded-full bg-forest px-5 py-3 font-medium text-white hover:bg-emerald-900">Search</button>
        </form>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCategory === category ? 'bg-forest text-white' : 'bg-white text-slate-700 ring-1 ring-stone-200 hover:text-forest'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-slate-600">{products.length} items available</p>
        <label className="flex items-center gap-2 text-sm text-slate-600"><span className="sr-only">Sort products</span><select aria-label="Sort products" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-forest">
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
