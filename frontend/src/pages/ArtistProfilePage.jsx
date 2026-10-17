import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Share2,
  Check,
  Globe,
  Instagram,
  Facebook,
  Edit3,
  Plus,
  X,
  UserCheck,
  UserPlus,
  Palette,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ArtistProfilePage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [artist, setArtist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('artworks');

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Share state
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    specialization: '',
    location: '',
    bio: '',
    instagram: '',
    website: '',
    facebook: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Fetch artist profile and products
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/users/artists/${artistId}`);
        if (!active) return;
        const loadedArtist = response.data?.data?.artist;
        const loadedProducts = response.data?.data?.products || [];

        if (!loadedArtist) {
          setError('Artist profile not found.');
          return;
        }

        setArtist(loadedArtist);
        setProducts(loadedProducts);
        setFollowerCount(loadedArtist.followerCount || 0);

        // Check if current user is already following
        const currentUserId = user?.id || user?._id;
        if (currentUserId && Array.isArray(loadedArtist.followers)) {
          setIsFollowing(loadedArtist.followers.includes(currentUserId.toString()));
        } else {
          setIsFollowing(false);
        }

        // Prepopulate edit modal form data
        setEditFormData({
          specialization: loadedArtist.specialization || '',
          location: loadedArtist.location || '',
          bio: loadedArtist.bio || '',
          instagram: loadedArtist.socials?.instagram || '',
          website: loadedArtist.socials?.website || '',
          facebook: loadedArtist.socials?.facebook || '',
        });
      } catch (requestError) {
        if (!active) return;
        const status = requestError.response?.status;
        if (status === 404) {
          setError('This artist profile does not exist or may have been removed.');
        } else {
          setError(requestError.response?.data?.message || 'Unable to load this artist profile. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [artistId, user]);

  // Check if logged-in user is the owner of this artist profile
  const isOwner = Boolean(
    user &&
    user.role === 'ARTIST' &&
    artist &&
    (
      (artist.userId && (user.id === artist.userId || user._id === artist.userId)) ||
      (user.id && user.id === artist.id) ||
      (user._id && user._id === artist.id)
    )
  );

  // Toggle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'CUSTOMER') {
      alert('Only customer accounts can follow artists.');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await api.delete(`/users/artists/${artistId}/follow`);
        setIsFollowing(false);
        setFollowerCount(res.data?.data?.followerCount ?? Math.max(0, followerCount - 1));
      } else {
        const res = await api.get ? await api.post(`/users/artists/${artistId}/follow`) : null;
        setIsFollowing(true);
        setFollowerCount(res?.data?.data?.followerCount ?? followerCount + 1);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Copy share link
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError('');
    setEditSuccess('');

    try {
      const payload = {
        specialization: editFormData.specialization.trim(),
        location: editFormData.location.trim(),
        bio: editFormData.bio.trim(),
        socials: {
          instagram: editFormData.instagram.trim(),
          website: editFormData.website.trim(),
          facebook: editFormData.facebook.trim(),
        },
      };

      const response = await api.patch('/users/artists/me', payload);
      const updated = response.data?.data?.artist;

      if (updated) {
        setArtist((prev) => ({
          ...prev,
          ...updated,
          productCount: prev?.productCount || products.length,
        }));
      }

      setEditSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess('');
      }, 1200);
    } catch (saveError) {
      setEditError(saveError.response?.data?.message || 'Failed to update artist profile. Please check your inputs.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="section-shell py-12">
        <div className="h-64 animate-pulse rounded-[2.5rem] bg-stone-200 dark:bg-stone-800" />
        <div className="mt-8 space-y-4">
          <div className="h-10 w-1/3 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-6 w-1/4 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    );
  }

  // Error / Not Found state
  if (error || !artist) {
    return (
      <div className="section-shell py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-blue-950/60 dark:text-blue-400">
            <AlertCircle size={32} />
          </div>
          <h1 className="mt-6 font-display text-4xl text-forest dark:text-slate-100">Artist Profile Unavailable</h1>
          <p role="alert" className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {error || 'The requested artist profile could not be found or has not been published.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/artists"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <ArrowLeft size={16} /> Browse Artists Directory
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-[#0f111a] dark:text-slate-200"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-10">
      {/* 1. Header Banner & Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-forest dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={16} /> All Artists
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-soft transition hover:border-forest hover:text-forest dark:border-stone-800 dark:bg-[#0f111a] dark:text-slate-300 dark:hover:text-blue-400"
          aria-label="Share artist profile"
        >
          {copiedLink ? (
            <>
              <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Share2 size={14} />
              <span>Share Profile</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Hero Editorial Cover Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-200/80 bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-200/60 p-6 shadow-soft dark:border-stone-800/80 dark:from-[#0b0e18] dark:via-[#111628] dark:to-[#0b0e18] sm:p-10 lg:p-12">
        {/* Background decorative artwork texture */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-forest/5 blur-3xl dark:bg-blue-600/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl dark:bg-emerald-600/5" />

        <div className="relative grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
          {/* Large Artist Avatar */}
          <div className="relative mx-auto lg:mx-0">
            <div className="h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-full border-4 border-white shadow-xl dark:border-stone-800">
              <img
                src={artist.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                alt={artist.name}
                className="h-full w-full object-cover"
              />
            </div>
            {artist.rating > 0 && (
              <div className="absolute -bottom-2 right-2 flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-amber-600 shadow-md dark:border-stone-700 dark:bg-stone-900 dark:text-amber-400">
                <Star size={13} fill="currentColor" />
                <span>{artist.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Artist Bio & Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-forest dark:bg-blue-900/40 dark:text-blue-300">
                  <Palette size={13} /> Verified Artist
                </span>
                {artist.specialization && (
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {artist.specialization}
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl text-forest dark:text-slate-100 font-bold tracking-tight">
                {artist.name}
              </h1>

              {artist.bio && (
                <p className="mt-4 max-w-3xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {artist.bio}
                </p>
              )}

              {/* Stats badges */}
              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                {artist.location && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin size={16} className="text-forest dark:text-blue-400" />
                    {artist.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-medium">
                  <ShoppingBag size={16} className="text-forest dark:text-blue-400" />
                  {products.length} {products.length === 1 ? 'Artwork' : 'Artworks'} listed
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles size={16} className="text-forest dark:text-blue-400" />
                  {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}
                </span>
              </div>
            </div>

            {/* Action Bar (Follow / Edit & Socials) */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80 pt-6 dark:border-stone-800">
              <div className="flex flex-wrap items-center gap-3">
                {/* Follow Button for customers or logged out */}
                {!isOwner && user?.role !== 'ARTIST' && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-soft transition disabled:opacity-60 ${
                      isFollowing
                        ? 'border border-stone-300 bg-white text-slate-800 hover:border-red-400 hover:text-red-600 dark:border-stone-700 dark:bg-stone-900 dark:text-slate-200'
                        : 'bg-forest text-white hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={16} className="text-forest dark:text-blue-400" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} /> Follow Artist
                      </>
                    )}
                  </button>
                )}

                {/* Edit Profile for artist owners */}
                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <Edit3 size={16} /> Edit Public Profile
                    </button>
                    <Link
                      to="/sell/products/new"
                      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-stone-900 dark:text-slate-200 dark:hover:text-blue-400"
                    >
                      <Plus size={16} /> Add Artwork
                    </Link>
                    <Link
                      to="/sell"
                      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-stone-900 dark:text-slate-200 dark:hover:text-blue-400"
                    >
                      Seller Dashboard
                    </Link>
                  </>
                )}
              </div>

              {/* Social Channels */}
              {artist.socials && (artist.socials.instagram || artist.socials.website || artist.socials.facebook) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">Connect:</span>
                  {artist.socials.instagram && (
                    <a
                      href={artist.socials.instagram.startsWith('http') ? artist.socials.instagram : `https://instagram.com/${artist.socials.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 shadow-soft transition hover:border-pink-500 hover:text-pink-600 dark:border-stone-800 dark:bg-stone-900 dark:text-slate-300 dark:hover:text-pink-400"
                      aria-label="Instagram profile"
                    >
                      <Instagram size={17} />
                    </a>
                  )}
                  {artist.socials.website && (
                    <a
                      href={artist.socials.website.startsWith('http') ? artist.socials.website : `https://${artist.socials.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 shadow-soft transition hover:border-forest hover:text-forest dark:border-stone-800 dark:bg-stone-900 dark:text-slate-300 dark:hover:text-blue-400"
                      aria-label="Artist Website"
                    >
                      <Globe size={17} />
                    </a>
                  )}
                  {artist.socials.facebook && (
                    <a
                      href={artist.socials.facebook.startsWith('http') ? artist.socials.facebook : `https://facebook.com/${artist.socials.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 shadow-soft transition hover:border-blue-600 hover:text-blue-600 dark:border-stone-800 dark:bg-stone-900 dark:text-slate-300 dark:hover:text-blue-400"
                      aria-label="Facebook page"
                    >
                      <Facebook size={17} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Editorial Tabs (Available Artworks / About the Artist) */}
      <div className="mt-12 border-b border-stone-200 dark:border-stone-800">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('artworks')}
            className={`relative pb-4 text-lg font-semibold transition ${
              activeTab === 'artworks'
                ? 'text-forest dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Available Artworks ({products.length})
            {activeTab === 'artworks' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`relative pb-4 text-lg font-semibold transition ${
              activeTab === 'about'
                ? 'text-forest dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            About the Artist
            {activeTab === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest dark:bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* 4. Tab Content */}
      <div className="mt-8">
        {activeTab === 'artworks' ? (
          <div>
            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-dashed border-stone-300 bg-white p-12 text-center dark:border-stone-800 dark:bg-[#0f111a]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-slate-500 dark:bg-stone-900 dark:text-slate-400">
                  <Palette size={26} />
                </div>
                <h3 className="mt-4 font-display text-2xl text-slate-800 dark:text-slate-100">No Artworks Listed Yet</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {isOwner
                    ? 'Your artist profile is live! Publish your first original piece to make it available for collectors worldwide.'
                    : 'This artist currently has no active pieces in their gallery. Follow them to be notified when new creations are released.'}
                </p>
                {isOwner ? (
                  <Link
                    to="/sell/products/new"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <Plus size={16} /> Add Your First Artwork
                  </Link>
                ) : (
                  <Link
                    to="/explore"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-forest hover:text-forest dark:border-stone-700 dark:bg-stone-900 dark:text-slate-300"
                  >
                    Explore Other Artworks
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            {/* Biography & Philosophy */}
            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft dark:border-stone-800 dark:bg-[#0f111a]">
              <h2 className="font-display text-2xl text-forest dark:text-slate-100">Biography &amp; Statement</h2>
              <div className="mt-4 space-y-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {artist.bio || `${artist.name} is a verified artist on Articraft specializing in hand-crafted artworks and unique designs.`}
              </div>

              <div className="mt-8 border-t border-stone-100 pt-6 dark:border-stone-800">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Direct Inquiries</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  For bespoke commissions, studio visits, or special inquiries, you can reach out directly via the verified social channels or website provided in the artist's profile header.
                </p>
              </div>
            </div>

            {/* Studio & Craft Details */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft dark:border-stone-800 dark:bg-[#0f111a]">
                <h3 className="font-display text-xl text-slate-900 dark:text-slate-100">Studio Details</h3>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Specialization</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{artist.specialization || 'Fine Art'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{artist.location || 'Independent Studio'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Articraft Community Rating</dt>
                    <dd className="mt-1 flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                      <Star size={15} fill="currentColor" /> {artist.rating > 0 ? artist.rating.toFixed(1) : 'New Artist'}
                      <span className="text-xs text-slate-400">({artist.reviewCount || 0} reviews)</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Community Support</dt>
                    <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{followerCount} followers</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Self-Service Edit Profile Modal (Only for profile owner) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-[#0f111a] sm:p-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-stone-100 hover:text-slate-700 dark:hover:bg-stone-800 dark:hover:text-slate-200"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-blue-400 font-semibold">Self-Service Profile</p>
              <h2 className="mt-1 font-display text-3xl text-forest dark:text-slate-100">Edit Artist Profile</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Update your public biography, artistic specialization, and social links.
              </p>
            </div>

            {editError && (
              <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Specialization / Medium (e.g. Oil Painter &amp; Ceramicist)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  placeholder="e.g. Ceramic Sculpture, Oil Painting, Handwoven Textiles"
                  className="mt-1.5 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-forest focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-slate-100 dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Studio Location (e.g. Kyoto, Japan / Jaipur, India)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="City, Country"
                  className="mt-1.5 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-forest focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-slate-100 dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Artist Biography &amp; Philosophy (max 2000 chars)
                </label>
                <textarea
                  rows={5}
                  maxLength={2000}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  placeholder="Tell collectors about your artistic journey, materials, and inspirations..."
                  className="mt-1.5 w-full rounded-2xl border border-stone-300 bg-stone-50 p-4 text-sm text-slate-800 outline-none transition focus:border-forest focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-slate-100 dark:focus:border-blue-400"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {editFormData.bio.length} / 2000
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Social &amp; Web Links
                </p>

                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-slate-500 dark:bg-stone-900 dark:text-slate-400">
                      <Instagram size={18} />
                    </div>
                    <input
                      type="text"
                      maxLength={120}
                      value={editFormData.instagram}
                      onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })}
                      placeholder="Instagram URL or @handle"
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-forest focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-slate-100 dark:focus:border-blue-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-slate-500 dark:bg-stone-900 dark:text-slate-400">
                      <Globe size={18} />
                    </div>
                    <input
                      type="text"
                      maxLength={200}
                      value={editFormData.website}
                      onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                      placeholder="Personal Website URL (https://...)"
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-forest focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-slate-100 dark:focus:border-blue-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-slate-500 dark:bg-stone-900 dark:text-slate-400">
                      <Facebook size={18} />
                    </div>
                    <input
                      type="text"
                      maxLength={200}
                      value={editFormData.facebook}
                      onChange={(e) => setEditFormData({ ...editFormData, facebook: e.target.value })}
                      placeholder="Facebook Profile URL or username"
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-forest focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-slate-100 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-stone-50 dark:border-stone-700 dark:text-slate-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-full bg-forest px-7 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-900 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
