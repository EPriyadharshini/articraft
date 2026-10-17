import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/users/artists');
        setArtists(response.data.data.artists || []);
      } catch (error) {
        console.error('Error loading artists', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="section-shell py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-blue-400">Our artists</p>
        <h1 className="mt-3 font-display text-5xl text-forest dark:text-slate-100">Meet the creative community</h1>
      </div>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 animate-pulse rounded-[2rem] border border-stone-200 bg-white/50 p-6 dark:border-stone-800 dark:bg-[#0f111a]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {artists.map((artist) => (
            <div key={artist.id} className="group flex flex-col justify-between rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 dark:border-stone-800 dark:bg-[#0f111a]">
              <div>
                <Link to={`/artist/${artist.id}`} className="block overflow-hidden rounded-[1.5rem]">
                  <img src={artist.avatar} alt={artist.name} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
                </Link>
                <div className="mt-5">
                  <Link to={`/artist/${artist.id}`} className="block">
                    <h3 className="text-2xl font-semibold text-slate-800 transition hover:text-forest dark:text-slate-100 dark:hover:text-blue-400">{artist.name}</h3>
                  </Link>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{artist.specialization}</p>
                  <p className="mt-4 line-clamp-3 text-slate-600 dark:text-slate-300">{artist.bio}</p>
                </div>
              </div>
              <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>{artist.location || 'Independent Studio'}</span>
                  <span>{artist.productCount} {artist.productCount === 1 ? 'work' : 'works'}</span>
                </div>
                <Link to={`/artist/${artist.id}`} className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700">
                  View Profile &amp; Gallery
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
