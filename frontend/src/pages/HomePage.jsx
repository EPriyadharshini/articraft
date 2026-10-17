import { ArrowRight, ArrowUpRight, CheckCircle2, Filter, Heart, Palette, Search, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Star, TrendingUp, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/currency';
import ProductCard from '../components/ProductCard';
import homelogo from '../../public/homelogo.jpg'

const categories = [
  { name: 'Textiles', description: 'Handwoven silk, linen & tapestry', image: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=900&q=80' },
  { name: 'Ceramics', description: 'Functional pottery & sculptural stoneware', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80' },
  { name: 'Jewelry', description: 'Handcrafted silver, gold & gemstones', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80' },
  { name: 'Art Prints', description: 'Botanical, abstract & archival editions', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80' },
];

const priceRanges = [
  { label: 'Under ₹50', min: 0, max: 50 },
  { label: '₹50 – ₹150', min: 50, max: 150 },
  { label: '₹150 – ₹300', min: 150, max: 300 },
  { label: '₹300+', min: 300, max: 10000 },
];

const styles = ['Abstract', 'Minimalist', 'Botanical', 'Boho', 'Traditional'];

const whyShopFeatures = [
  {
    icon: Palette,
    title: 'Authentic Handmade Art',
    description: 'Every creation is made directly by verified independent artists and artisanal makers.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments via Razorpay',
    description: 'Server-verified checkout with transparent order receipts and protected transactions.',
  },
  {
    icon: Truck,
    title: 'Tracked Delivery & Transparent Shipping',
    description: 'Free shipping on orders above ₹120 with end-to-end seller order status tracking.',
  },
  {
    icon: Heart,
    title: 'Directly Support Creators',
    description: 'Your patronage directly funds artists, sustaining independent craftsmanship.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['All', 'Textiles', 'Ceramics', 'Jewelry', 'Art Prints']);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Search & filter state in Hero
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');

  // Collections tab
  const [collectionTab, setCollectionTab] = useState('trending');

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const [productsRes, artistsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=12'),
          api.get('/users/artists'),
          api.get('/products/categories').catch(() => ({ data: { data: { categories: [] } } })),
        ]);

        if (!active) return;

        const allProducts = productsRes.data?.data?.products || [];
        setProducts(allProducts);

        const allArtists = artistsRes.data?.data?.artists || [];
        setFeaturedArtists(allArtists);

        if (categoriesRes.data?.data?.categories?.length) {
          setCategoriesList(categoriesRes.data.data.categories);
        }

        // Fetch genuine customer reviews from products with reviews
        const reviewedProduct = allProducts.find((p) => p.reviewCount > 0);
        if (reviewedProduct) {
          try {
            const revRes = await api.get(`/reviews/product/${reviewedProduct.id}`);
            if (active && revRes.data?.data?.reviews?.length) {
              setReviews(revRes.data.data.reviews.slice(0, 3));
            }
          } catch {
            // Reviews remain empty if none exist yet
          }
        }
      } catch (error) {
        console.error('Error loading homepage content', error);
      }
    };

    loadContent();
    return () => {
      active = false;
    };
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedPrice) {
      const range = priceRanges.find((r) => r.label === selectedPrice);
      if (range) {
        if (range.min !== undefined) params.set('minPrice', range.min);
        if (range.max !== undefined) params.set('maxPrice', range.max);
      }
    }
    if (selectedStyle) {
      const combined = searchQuery.trim() ? `${searchQuery.trim()} ${selectedStyle}` : selectedStyle;
      params.set('search', combined);
    }
    navigate(`/explore?${params.toString()}`);
  };

  // Filter products for curated collections
  const curatedProducts = () => {
    if (collectionTab === 'trending') {
      return [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 4);
    }
    if (collectionTab === 'new') {
      return [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
    }
    if (collectionTab === 'top-rated') {
      return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    }
    return products.slice(0, 4);
  };

  const risingArtists = featuredArtists;
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full">
      {/* 1. Large Editorial Art Presentation Hero — Saatchi Art inspired spacious 2-column layout */}
      <section className="border-b border-stone-200/60 bg-[#fffaf5] py-12 lg:py-20 dark:border-stone-800/80 dark:bg-[#05060f]">
        <div className="section-shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6 lg:pr-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
              <Sparkles size={14} /> Curated Artisan Marketplace
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal leading-[1.12] tracking-tight text-forest dark:text-white"
            >
              Discover Art.<br />
              <span className="italic font-serif">Support Artists.</span><br />
              Own Something Handmade.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed dark:text-slate-300"
            >
              Explore one-of-a-kind original artworks, ceramic vessels, handwoven tapestries, and limited-edition prints crafted by independent creators across the globe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link to="/explore" className="inline-flex items-center gap-2.5 rounded-full bg-forest px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-900">
                Shop the Collection <ArrowRight size={17} />
              </Link>
              <Link to="/artists" className="inline-flex items-center gap-2.5 rounded-full border border-stone-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-[#0b0d16] dark:text-slate-200">
                Meet the Makers
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-6 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> Direct from Independent Artists</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> Secure Razorpay Verification</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> Tracked Delivery</span>
            </motion.div>
          </div>

          {/* Hero Visual Presentation — Expansive Aspect Ratio */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18 }} className="relative">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-200/80 bg-white p-3 shadow-soft dark:border-stone-800 dark:bg-[#0b0d16]">
              <img
                src={homelogo}
                alt="Artisan ceramic craft showcase"
                className="h-[460px] sm:h-[540px] xl:h-[620px] w-full rounded-[2rem] object-cover"
              />
              <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur-md dark:border-stone-800/80 dark:bg-[#0b0d16]/90">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-blue-900/40 dark:text-blue-300">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Curator Spotlight</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Handcrafted ceramics, tapestries &amp; sculptures</p>
                  </div>
                </div>
                <Link to="/explore" className="hidden sm:inline-flex rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-900">
                  Explore
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Featured Artwork Section */}
      <section className="border-b border-stone-200/60 bg-white py-16 dark:border-stone-800/80 dark:bg-[#080a12]">
        <div className="section-shell">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-500 dark:text-blue-400">Featured Artwork</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-forest dark:text-slate-100">Discover Handcrafted Stories</h2>
            </div>
            <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline dark:text-blue-400">
              Browse all artworks <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Shop by Category Section */}
      <section className="bg-[#f4efe8] py-16 dark:bg-[#0b0e18]">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-blue-400">Browse by medium</p>
              <h2 className="mt-2 font-display text-4xl text-forest dark:text-slate-100">Shop by Category</h2>
            </div>
            <Link to="/explore" className="hidden items-center gap-2 text-sm font-medium text-slate-700 hover:text-forest dark:text-slate-300 dark:hover:text-blue-400 md:flex">
              All categories <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ name, description, image }) => (
              <Link
                key={name}
                to={`/explore?category=${encodeURIComponent(name)}`}
                className="group relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft transition hover:-translate-y-1 dark:border-stone-800 dark:bg-[#0f111a]"
              >
                <div className="overflow-hidden">
                  <img src={image} alt={name} className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-800 group-hover:text-forest dark:text-slate-100 dark:group-hover:text-blue-400">{name}</h3>
                    <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-forest dark:group-hover:text-blue-400" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Curated Collections Section */}
      <section className="section-shell py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-blue-400">Curated for you</p>
            <h2 className="mt-2 font-display text-4xl text-forest dark:text-slate-100">Art Collections</h2>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-stone-200 bg-stone-100 p-1 dark:border-stone-800 dark:bg-[#0f111a]">
            <button
              onClick={() => setCollectionTab('trending')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                collectionTab === 'trending' ? 'bg-forest text-white dark:bg-blue-600 dark:text-white' : 'text-slate-600 hover:text-forest dark:text-slate-300 dark:hover:text-blue-400'
              }`}
            >
              Trending Art
            </button>
            <button
              onClick={() => setCollectionTab('top-rated')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                collectionTab === 'top-rated' ? 'bg-forest text-white dark:bg-blue-600 dark:text-white' : 'text-slate-600 hover:text-forest dark:text-slate-300 dark:hover:text-blue-400'
              }`}
            >
              Top Rated
            </button>
            <button
              onClick={() => setCollectionTab('new')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                collectionTab === 'new' ? 'bg-forest text-white dark:bg-blue-600 dark:text-white' : 'text-slate-600 hover:text-forest dark:text-slate-300 dark:hover:text-blue-400'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {curatedProducts().map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Rising Artists */}
      {risingArtists.length > 0 && (
        <section className="bg-[#f5f1eb] py-16 dark:bg-[#080a12]">
          <div className="section-shell">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-blue-400">Emerging talent</p>
                <h2 className="mt-2 font-display text-4xl text-forest dark:text-slate-100">Rising Artists</h2>
              </div>
              <Link to="/artists" className="hidden items-center gap-2 text-sm font-medium text-slate-700 hover:text-forest dark:text-slate-300 dark:hover:text-blue-400 md:flex">
                View all artists <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {risingArtists.map((artist) => (
                <Link
                  key={artist.id || artist._id}
                  to={`/artist/${artist.id || artist._id}`}
                  className="flex items-center gap-3.5 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-soft transition hover:border-forest dark:border-stone-800 dark:bg-[#0f111a] dark:hover:border-blue-500"
                >
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={artist.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-forest text-lg font-semibold text-white">
                      {(artist.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{artist.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{artist.specialization}</p>
                    <p className="mt-1 truncate text-xs text-forest dark:text-blue-400">{artist.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Why Shop on Articraft Section */}
      <section className="section-shell py-16">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-blue-400">The Articraft promise</p>
          <h2 className="mt-2 font-display text-4xl text-forest dark:text-slate-100">Why Shop on Articraft</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyShopFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-soft dark:border-stone-800 dark:bg-[#0f111a]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-forest dark:bg-blue-900/40 dark:text-blue-300">
                <Icon size={24} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Customer Reviews (Rendered only when real reviews exist) */}
      {reviews.length > 0 && (
        <section className="bg-[#f4efe8] py-16 dark:bg-[#0b0e18]">
          <div className="section-shell">
            <div className="mb-8 text-center">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-blue-400">Collector feedback</p>
              <h2 className="mt-2 font-display text-4xl text-forest dark:text-slate-100">What Art Collectors Say</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft dark:border-stone-800 dark:bg-[#0f111a]">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm italic text-slate-700 dark:text-slate-200">"{rev.comment}"</p>
                  <div className="mt-5 border-t border-stone-100 pt-3 text-xs text-slate-500 dark:border-stone-800 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{rev.user?.name || 'Verified Customer'}</span>
                    <span className="ml-2">Verified Purchase</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Creator Call to Action */}
      <section className="section-shell py-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-forest px-8 py-16 text-white shadow-soft lg:px-16 dark:border dark:border-stone-800 dark:bg-[#0d1326]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-amber-200 backdrop-blur dark:bg-blue-500/10 dark:text-blue-300">
              <Palette size={14} /> Join Our Artisan Community
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl text-white">
              Are you an artist or artisan? Showcase your craft to art lovers.
            </h2>
            <p className="mt-4 text-base text-stone-200 dark:text-slate-300">
              Open your shop, manage products, receive tracked orders, and connect with collectors worldwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-forest transition hover:bg-black-700 dark:bg-black-900 dark:text-white dark:hover:bg-blue-900">
                Become a Seller
              </Link>
              <Link to="/about" className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10 dark:border-stone-700 dark:hover:bg-stone-800">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}