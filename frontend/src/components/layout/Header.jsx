import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const { push } = useToast();
  const { count: wishlistCount } = useWishlist();

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    try {
      await logout();
      push('Logged out');
      navigate('/');
    } catch (err) {
      push(err.message, { type: 'error' });
    }
  };

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());

    const categoryMatch = location.pathname.match(/^\/c\/([^/]+)/);
    const basePath = categoryMatch ? `/c/${categoryMatch[1]}` : '/';

    const qs = params.toString();
    navigate(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <header className="sticky top-0 z-40 bg-flipBlue shadow-header">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 md:gap-8">
        <Link
          to="/"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 shadow-sm hover:brightness-105"
          style={{ backgroundColor: '#FFE500' }}
          aria-label="Flipkart home"
        >
          <svg
            width="20"
            height="22"
            viewBox="0 0 20 24"
            fill="#2874F0"
            aria-hidden
          >
            <path d="M3 23 L7 1 L18 1 Q20 1 19.5 3 L19 5 Q18.5 6 17 6 L10.5 6 L9.8 10 L15.5 10 Q17 10 16.6 11.5 L16.2 13 Q15.8 14 14.4 14 L9 14 L7 23 Z" />
          </svg>
          <span className="text-xl font-extrabold italic leading-none tracking-tight text-black">
            Flipkart
          </span>
        </Link>

        <form onSubmit={onSubmit} className="flex-1">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-flipBlue"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="h-9 w-full rounded-sm bg-white pl-10 pr-3 text-sm text-flipText placeholder:text-flipMuted focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>
        </form>

        {user ? (
          <>
            <Link
              to="/wishlist"
              className="hidden text-sm font-semibold text-white hover:opacity-90 md:inline"
            >
              Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
            </Link>
            <Link
              to="/orders"
              className="hidden text-sm font-semibold text-white hover:opacity-90 md:inline"
            >
              Orders
            </Link>
            <span
              className="hidden max-w-[140px] truncate text-sm font-semibold text-white md:inline"
              title={user.email}
            >
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold text-white hover:opacity-90"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded bg-white px-6 py-1 text-sm font-semibold text-flipBlue hover:bg-white/95"
          >
            Login
          </Link>
        )}

        <Link
          to="/cart"
          className="flex items-center gap-2 font-semibold text-white hover:opacity-90"
        >
          <span className="relative inline-flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4m10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4M7.16 14h9.45c.75 0 1.41-.41 1.75-1.03l3.24-5.88L19.42 6 16.55 11H8.53L4.27 2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7z" />
            </svg>
            {cart.item_count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-flipOrange px-1 text-[10px] font-bold leading-none text-white">
                {cart.item_count}
              </span>
            )}
          </span>
          <span className="hidden md:inline">Cart</span>
        </Link>
      </div>
    </header>
  );
}
