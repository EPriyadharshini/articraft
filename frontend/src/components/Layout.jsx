import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, Heart, UserRound, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Marketplace', to: '/explore' },
  { label: 'Artists', to: '/artists' },
  { label: 'Journal', to: '/journal' },
  { label: 'Sell', to: '/sell' },
  { label: 'Admin', to: '/admin', roles: ['ADMIN'] },
];

export default function Layout({ children }) {
  const { cart, wishlist, user, logout, error: cartError } = useAppContext();
  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffaf5] text-slate-900">
      <a href="#main-content" className="skip-link rounded-full bg-forest px-4 py-2 text-sm font-medium text-white">Skip to main content</a>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#fffaf5]/80 backdrop-blur-xl">
        <div className="section-shell flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white shadow-soft">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="font-display text-2xl tracking-tight">Articraft</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            {visibleNavItems.map(({ label, to }) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'text-forest' : 'hover:text-forest')}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link to="/wishlist" className="relative rounded-full border border-stone-300 p-2.5 transition hover:border-forest hover:text-forest" aria-label="Wishlist">
              <Heart size={17} />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative rounded-full border border-stone-300 p-2.5 transition hover:border-forest hover:text-forest" aria-label="Cart">
              <ShoppingBag size={17} />
              {cart.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/account" className="flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-white">
                  <UserRound size={15} />
                  {user.name.split(' ')[0]}
                </Link>
                <button onClick={logout} className="text-sm text-slate-600 hover:text-forest">Log Out</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium hover:border-forest hover:text-forest">Login</Link>
                <Link to="/signup" className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-emerald-900">Sign up</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden"><ThemeToggle /><button className="rounded-full border border-stone-300 p-2.5" onClick={() => setMenuOpen((prev) => !prev)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            <Menu size={18} />
          </button></div>
        </div>

        {menuOpen && (
          <div id="mobile-navigation" className="border-t border-stone-200 bg-white md:hidden">
            <div className="section-shell flex flex-col gap-3 py-4 text-sm font-medium text-slate-700">
              {visibleNavItems.map(({ label, to }) => (
                <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => (isActive ? 'text-forest' : 'hover:text-forest')}>
                  {label}
                </NavLink>
              ))}
              <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist{wishlist.length ? ` (${wishlist.length})` : ''}</NavLink>
              <NavLink to="/cart" onClick={() => setMenuOpen(false)}>Cart{cart.length ? ` (${cart.reduce((sum, item) => sum + item.quantity, 0)})` : ''}</NavLink>
              {user && <NavLink to="/account" onClick={() => setMenuOpen(false)}>My account</NavLink>}
              {user ? <button onClick={() => { logout(); setMenuOpen(false); }} className="w-fit text-sm text-slate-700 hover:text-forest">Log Out</button> : <><NavLink to="/login" onClick={() => setMenuOpen(false)}>Sign In</NavLink><NavLink to="/signup" onClick={() => setMenuOpen(false)}>Create Account</NavLink></>}
            </div>
          </div>
        )}
      </header>

      <main id="main-content" tabIndex="-1">
        {cartError && <div className="section-shell pt-4"><p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{cartError}</p></div>}
        {children}
      </main>

      <footer className="border-t border-stone-200 bg-[#f2ebe4]">
        <div className="section-shell grid gap-10 py-12 md:grid-cols-4">
          <div>
            <div className="font-display text-3xl text-forest">Articraft</div>
            <p className="mt-4 text-sm text-slate-600">Discover art. Support artists. Own something handmade.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Marketplace</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/explore">Marketplace</Link></li>
              <li><Link to="/artists">Artists</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">For artists</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link to={user?.role === 'ARTIST' ? '/sell' : '/signup'}>Sell with Articraft</Link></li>
              {user?.role === 'ARTIST' && <><li><Link to="/sell/products">My Products</Link></li><li><Link to="/sell/orders">Seller Orders</Link></li></>}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/refunds">Refund &amp; Cancellation Policy</Link></li>
              <li><Link to="/shipping">Shipping &amp; Delivery</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
