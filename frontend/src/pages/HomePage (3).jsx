import { ArrowRight, ArrowUpRight, CheckCircle2, Palette, Search, ShoppingCart, Sparkles, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/currency';


const categories = [
  { name: 'Textiles', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80' },
  { name: 'Ceramics', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80' },
  { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80' },
  { name: 'Art Prints', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80' },
];

const features = [
  'Handmade collections',
  'Independent makers',
  'Checkout and order tracking',
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, artistsRes] = await Promise.all([
          api.get('/products'),
          api.get('/users/artists'),
        ]);
        setProducts((productsRes.data.data.products || []).slice(0, 4));
        setFeaturedArtists((artistsRes.data.data.artists || []).slice(0, 3));
      } catch (error) {
        console.error('Error loading homepage content', error);
      }
    };

    load();
  }, []);

  return (
    <div>
      <section className="section-shell grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-20">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <Sparkles size={15} />
            Artisan marketplace
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="hero-heading mt-6 max-w-xl font-display text-5xl leading-tight text-forest sm:text-6xl">
            Discover Art. Support Artists. Own Something Handmade.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 max-w-lg text-lg text-slate-600">
            Shop pieces from independent artists, artisans, and makers.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/explore" className="glow-btn inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-medium text-white shadow-soft transition hover:bg-emerald-900">
              <span className="glow-blob" />
              <span className="glow-inner flex items-center gap-2">
                Shop the collection <ArrowRight size={18} />
              </span>
            </Link>
            <Link to="/artists" className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:border-forest hover:text-forest">
              Meet the makers
            </Link>
          </motion.div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-600">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18 }} className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-soft">
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80" alt="Artisan marketplace hero" className="h-[620px] w-full rounded-[1.5rem] object-cover" />
          </div>
          <div className="absolute -bottom-6 left-6 rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="text-sm text-slate-500">This week</div>
                <div className="text-xl font-semibold text-slate-800">Explore handmade work</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-[#f4efe8] py-16">
        <div className="section-shell">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Featured artwork</p>
              <h2 className="mt-3 font-display text-4xl text-forest">Discover handcrafted stories</h2>
            </div>
            <Link to="/explore" className="hidden items-center gap-2 text-sm font-medium text-slate-700 md:flex">
              Explore more <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-soft">
                <img src={product.images?.[0]} alt={product.name} className="h-72 w-full object-cover" />
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                    <span>{product.category}</span>
                    <span className="flex items-center gap-1 text-amber-600"><Star size={14} fill="currentColor" /> {product.rating}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">by {product.artist}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-forest">{formatINR(product.price)}</span>
                    <Link to={`/product/${product.id}`} className="rounded-full bg-[#f2ece4] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#e9e0d7]">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Explore categories</p>
          <h2 className="mt-3 font-display text-4xl text-forest">Find your next favorite piece</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map(({ name, image }) => (
            <div key={name} className="group relative overflow-hidden rounded-[2rem]">
              <img src={image} alt={name} className="h-80 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-2xl font-semibold">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f1eb] py-16">
        <div className="section-shell">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Featured artists</p>
              <h2 className="mt-3 font-display text-4xl text-forest">Meet the makers</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredArtists.map((artist) => (
              <div key={artist.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
                <img src={artist.avatar} alt={artist.name} className="h-52 w-full rounded-[1.5rem] object-cover" />
                <div className="mt-5">
                  <h3 className="text-2xl font-semibold text-slate-800">{artist.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{artist.specialization}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span>{artist.location}</span>
                    <span className="flex items-center gap-1 text-amber-600"><Star size={14} fill="currentColor" /> {artist.rating}</span>
                  </div>
                  <Link to={`/artist/${artist.id}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900">
                    View profile <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
            <Palette className="text-clay" size={28} />
            <h3 className="mt-6 text-2xl font-semibold text-slate-800">Sell your art</h3>
            <p className="mt-3 text-slate-600">Create a shop, highlight your process, and connect with customers who value handmade work.</p>
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
            <Search className="text-clay" size={28} />
            <h3 className="mt-6 text-2xl font-semibold text-slate-800">Discover beautiful finds</h3>
            <p className="mt-3 text-slate-600">Browse pieces from craft communities across the globe.</p>
          </div>
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
            <ShoppingCart className="text-clay" size={28} />
            <h3 className="mt-6 text-2xl font-semibold text-slate-800">Manage your purchases</h3>
            <p className="mt-3 text-slate-600">Track orders and review eligible purchases.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
