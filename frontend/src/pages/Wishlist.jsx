import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import HeartButton from '../components/product/HeartButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatRupees } from '../utils/format.js';

export default function Wishlist() {
  const { items, loading } = useWishlist();

  if (loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 p-2 md:p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl p-4">
        <EmptyState
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it for later."
          action={
            <Link
              to="/"
              className="mt-2 inline-block bg-flipBlue px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-2 md:p-4">
      <header className="mb-3 flex items-baseline justify-between bg-white px-4 py-3 shadow-card">
        <h1 className="text-base font-semibold text-flipText">My Wishlist</h1>
        <span className="text-xs font-semibold text-flipMuted">
          {items.length} item{items.length === 1 ? '' : 's'}
        </span>
      </header>

      <ul className="bg-white shadow-card">
        {items.map((item) => (
          <WishlistRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function WishlistRow({ item }) {
  const { addItem } = useCart();
  const { toggle } = useWishlist();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  const moveToCart = async () => {
    if (!item.in_stock) return;
    setBusy(true);
    try {
      await addItem(item.product_id, 1);
      await toggle(item.product_id);
      push('Moved to cart');
    } catch (err) {
      push(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex gap-4 border-b border-flipBorder p-4 last:border-b-0">
      <Link
        to={`/p/${item.product_id}`}
        className="flex h-28 w-28 flex-shrink-0 items-center justify-center bg-white"
      >
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.product_name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-xs text-flipMuted">No image</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <Link
          to={`/p/${item.product_id}`}
          className="line-clamp-2 text-sm font-medium text-flipText hover:text-flipBlue"
        >
          {item.product_name}
        </Link>
        <div className="text-xs text-flipMuted">{item.brand}</div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-semibold text-flipText">{formatRupees(item.price)}</span>
          {Number(item.mrp) > Number(item.price) && (
            <>
              <span className="text-xs text-flipMuted line-through">{formatRupees(item.mrp)}</span>
              <span className="text-xs font-semibold text-flipGreen">{item.discount_percent}% off</span>
            </>
          )}
        </div>

        {!item.in_stock && (
          <span className="text-xs font-semibold text-flipOrange">Out of stock</span>
        )}

        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={moveToCart}
            disabled={busy || !item.in_stock}
            className="bg-flipYellow px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-50"
          >
            Move to cart
          </button>
        </div>
      </div>

      <div className="flex-shrink-0">
        <HeartButton productId={item.product_id} />
      </div>
    </li>
  );
}
