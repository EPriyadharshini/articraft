import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/currency';

export default function ArtistProfilePage() {
  const { artistId } = useParams();
  const [artist, setArtist] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/users/artists/${artistId}`);
        setArtist(response.data.data.artist);
        setProducts(response.data.data.products || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load this artist profile.');
      }
    };

    load();
  }, [artistId]);

  if (error) {
    return <div className="section-shell py-12"><h1 className="font-display text-4xl text-forest">Artist profile unavailable</h1><p role="alert" className="mt-5 text-lg text-slate-600">{error}</p><Link to="/artists" className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 font-medium text-white">Browse artists</Link></div>;
  }

  if (!artist) {
    return <div className="section-shell py-12 text-lg text-slate-600">Loading artist profile...</div>;
  }

  return (
    <div className="section-shell py-12">
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft md:p-10">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <img src={artist.avatar} alt={artist.name} className="h-80 w-full rounded-[2rem] object-cover" />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Artist profile</p>
            <h1 className="mt-3 font-display text-5xl text-forest">{artist.name}</h1>
            <p className="mt-3 text-lg text-slate-600">{artist.specialization}</p>
            <p className="mt-6 text-slate-600">{artist.bio}</p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
              <span>📍 {artist.location}</span>
              <span>⭐ {artist.rating}</span>
              <span>{artist.productCount} products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-4xl text-forest">Featured work</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} to={`/product/${product.slug || product.id}`} className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-soft">
                <img src={product.images?.[0]} alt={product.name} className="h-64 w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-800">{product.name}</h3>
                  <div className="mt-4 text-2xl font-bold text-forest">{formatINR(product.price)}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-[1.75rem] border border-dashed border-stone-300 bg-white p-8 text-slate-500">
              This artist has not added products yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
