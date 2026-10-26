import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Menu, ShoppingBag, Heart, UserRound, Sparkles, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Marketplace', to: '/explore' },
  { label: 'Artists', to: '/artists' },
  { label: 'Journal', to: '/journal' },
  { label: 'Sell', to: '/sell', roles: ['ARTIST'] },
  { label: 'Admin', to: '/admin', roles: ['ADMIN'] },
];

const headerCategories = ['Textiles', 'Ceramics', 'Jewelry', 'Art Prints', 'Furniture', 'Paintings'];

export default function Layout({ children }) {
  const { cart, wishlist, user, logout, error: cartError } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Amazon-style header search state, synchronized with URL query params
  const [headerSearch, setHeaderSearch] = useState(() => searchParams.get('search') || '');
  const [headerCategory, setHeaderCategory] = useState(() => searchParams.get('category') || 'All');

  useEffect(() => {
    if (location.pathname === '/explore') {
      setHeaderSearch(searchParams.get('search') || '');
      setHeaderCategory(searchParams.get('category') || 'All');
    }
  }, [location.pathname, searchParams]);

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (headerSearch.trim()) params.set('search', headerSearch.trim());
    if (headerCategory && headerCategory !== 'All') params.set('category', headerCategory);
    navigate(`/explore?${params.toString()}`);
  };
  
    const handleCategoryChange = (value) => {
    setHeaderCategory(value);
    const params = new URLSearchParams();
    if (headerSearch.trim()) params.set('search', headerSearch.trim());
    if (value && value !== 'All') params.set('category', value);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-slate-900 dark:bg-[#05060f] dark:text-slate-100">
      <a
        href="#main-content"
        className="skip-link rounded-full bg-forest px-4 py-2 text-sm font-medium text-white dark:bg-blue-600"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#fffaf5]/90 backdrop-blur-xl dark:border-stone-800 dark:bg-[#05060f]/90">
        {/* Primary Header Row: Brand, Amazon-style Search, Actions */}
        <div className="section-shell flex items-center justify-between gap-4 py-3.5">
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white shadow-soft dark:bg-blue-600">
              <Sparkles size={18} />
            </div> */}
          <Link to="/about" className="flex items-center gap-2.5 shrink-0">
            {/* <img
              src={isDark ? "/logo2.png" : "/whitetheme.png"}
              alt="Articraft logo"
              width="50"
              height="50"
              className="h-15 w-20 rounded-full object-cover shadow-soft"
            /> */}
            <span
              className={`
      text-3xl sm:text-4xl
      font-black tracking-tight
      transition-all duration-300
      group-hover:scale-105
      ${
        isDark
          ? "bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 bg-clip-text text-transparent"
          : "text-green-800"
      }
    `}
            >
              Articraft
            </span>
            {/* <div>
                <div className="font-display text-2xl font-bold tracking-tight text-forest dark:text-slate-100">
                  Articraft
                </div>
              </div> */}
          </Link>

          {/* search bar on desktop */}
          <form
            onSubmit={handleHeaderSearch}
            className="hidden flex-1 max-w-2xl lg:flex items-center rounded-full border border-stone-300 bg-white shadow-sm transition-all  dark:border-stone-700 dark:bg-[#0b0d16] dark:focus-within:border-blue-500"
          >
            <select
              aria-label="Search category"
              value={headerCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="h-10 rounded-l-full border-r border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-slate-700 outline-none hover:bg-stone-100 dark:border-stone-800 dark:bg-[#141824] dark:text-slate-300"
            >
              <option value="All">All Categories</option>
              {headerCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search original art, artisan pottery, textiles, jewelry..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="h-10 flex-1 bg-transparent px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:outline-none  dark:text-slate-100 dark:placeholder-slate-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-10 items-center justify-center rounded-r-full bg-forest px-5 text-white transition hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Navigation links & User actions */}
          <div className="hidden items-center gap-4 lg:flex">
            <nav className="flex items-center gap-5 text-sm font-medium text-slate-700 dark:text-slate-300">
              {visibleNavItems.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive
                      ? "text-forest font-semibold dark:text-blue-400"
                      : "hover:text-forest transition dark:hover:text-blue-400"
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700" />

            <div className="flex items-center gap-2.5">
              <Link
                to="/wishlist"
                className="relative rounded-full border border-stone-300 p-2 text-slate-700 transition hover:border-forest hover:text-forest dark:border-stone-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                aria-label="Wishlist"
              >
                <Heart size={16} />
                {wishlist.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className="relative rounded-full border border-stone-300 p-2 text-slate-700 transition hover:border-forest hover:text-forest dark:border-stone-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                aria-label="Cart"
              >
                <ShoppingBag size={16} />
                {cart.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-bold text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative ml-1 flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Hi, {user.name.split(" ")[0]}
                  </span>

                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    aria-label="Open profile menu"
                    aria-expanded={profileMenuOpen}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-slate-700 transition hover:border-forest hover:bg-stone-100 hover:text-forest dark:border-stone-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:bg-[#141824] dark:hover:text-blue-400"
                  >
                    <UserRound size={19} />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-stone-200 bg-white py-2 shadow-xl dark:border-stone-700 dark:bg-[#0b0d16]">
                      <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {user.role}
                        </p>
                      </div>

                      <Link
                        to="/account"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-slate-700 transition hover:bg-stone-100 hover:text-forest dark:text-slate-200 dark:hover:bg-[#141824] dark:hover:text-blue-400"
                      >
                        <span className="flex items-center gap-3">
                          <UserRound size={16} />
                          My Profile
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <span>↪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center ml-1">
                  <Link
                    to="/login"
                    className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-900 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Link
              to="/cart"
              className="relative rounded-full border border-stone-300 p-2 text-slate-700 dark:border-stone-700 dark:text-slate-300"
              aria-label="Cart"
            >
              <ShoppingBag size={16} />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-bold text-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
            <button
              className="rounded-full border border-stone-300 p-2 text-slate-700 dark:border-stone-700 dark:text-slate-300"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-[#0b0d16] lg:hidden"
          >
            <form
              onSubmit={(e) => {
                handleHeaderSearch(e);
                setMenuOpen(false);
              }}
              className="mb-4 mr-10 flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-2 transition-colors dark:border-stone-800 dark:bg-[#0b0d16]"
            >
              <input
                type="text"
                placeholder="Search art, makers..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="!w-full !border-0 !bg-transparent text-sm text-stone-900 placeholder:text-slate-400 !outline-none !ring-0 focus:!border-0 focus:!bg-transparent focus:!outline-none focus:!ring-0 focus-visible:!outline-none dark:text-stone-100 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="shrink-0 text-forest outline-none focus:outline-none dark:text-blue-400"
              >
                <Search size={16} />
              </button>
            </form>

            <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              {visibleNavItems.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "text-forest font-semibold" : "hover:text-forest"
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="border-t border-stone-100 pt-2 dark:border-stone-800">
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {headerCategories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/explore?category=${encodeURIComponent(cat)}`}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full border border-stone-200 px-3 py-1 text-xs text-slate-600 hover:border-forest hover:text-forest dark:border-stone-700"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>
                Wishlist{wishlist.length ? ` (${wishlist.length})` : ""}
              </NavLink>
              <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
                Cart
                {cart.length
                  ? ` (${cart.reduce((sum, item) => sum + item.quantity, 0)})`
                  : ""}
              </NavLink>
              {user && (
                <NavLink to="/account" onClick={() => setMenuOpen(false)}>
                  My account
                </NavLink>
              )}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-fit text-sm text-slate-700 hover:text-forest"
                >
                  Log Out
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-fit rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white dark:bg-blue-600"
                >
                  Get Started
                </NavLink>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="main-content" tabIndex="-1">
        {cartError && (
          <div className="section-shell pt-4">
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {cartError}
            </p>
          </div>
        )}
        {children}
      </main>

      <footer className="border-t border-stone-200 bg-[#f2ebe4] text-slate-800 dark:border-stone-800 dark:bg-[#05060f] dark:text-slate-200">
        <div className="section-shell py-12">
          <div className="mb-10 max-w-md">
            <div className="font-display text-3xl text-forest dark:text-slate-100">
              Articraft
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Discover art. Support artists. Own something handmade.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Explore
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    to="/"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/explore"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    to="/artists"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Artists
                  </Link>
                </li>
                <li>
                  <Link
                    to="/journal"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Journal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                For Artists
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Become an Artist
                  </Link>
                </li>
                <li>
                  <Link
                    to={user?.role === "ARTIST" ? "/sell/products" : "/login"}
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Sell Products
                  </Link>
                </li>
                <li>
                  <Link
                    to={user?.role === "ARTIST" ? "/sell" : "/login"}
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Artist Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Customer Support
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Shipping &amp; Delivery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/refunds"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Returns &amp; Refunds
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                About Articraft
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-forest dark:hover:text-blue-400"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}