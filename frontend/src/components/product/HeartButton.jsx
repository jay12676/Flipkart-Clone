import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

export default function HeartButton({ productId, size = 'md', className = '' }) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { push } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const active = isWishlisted(productId);
  const dims = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const iconSize = size === 'lg' ? 22 : 18;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await toggle(productId);
      push(active ? 'Removed from wishlist' : 'Added to wishlist', { type: 'info' });
    } catch (err) {
      push(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className={`flex ${dims} items-center justify-center rounded-full bg-white/95 shadow-card transition hover:bg-white disabled:opacity-50 ${className}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? '#E53935' : 'none'}
        stroke={active ? '#E53935' : '#878787'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
