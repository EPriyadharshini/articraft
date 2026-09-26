import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/users/artists');
        setArtists(response.data.data.artists);
      } catch (error) {
        console.error('Error loading artists', error);
      }
    };

    load();
  }, []);

  return (
    <div className="section-shell py-12">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Our artists</p>
        <h1 className="mt-3 font-display text-5xl text-forest">Meet the creative community</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {artists.map((artist) => (
          <div key={artist.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
            <img src={artist.avatar} alt={artist.name} className="h-72 w-full rounded-[1.5rem] object-cover" />
            <div className="mt-5">
              <h3 className="text-2xl font-semibold text-slate-800">{artist.name}</h3>
              <p className="mt-2 text-sm text-slate-500">{artist.specialization}</p>
              <p className="mt-4 text-slate-600">{artist.bio}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                <span>{artist.location}</span>
                <span>{artist.productCount} products</span>
              </div>
              <Link to={`/artist/${artist.id}`} className="mt-6 inline-flex rounded-full bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900">View profile</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
