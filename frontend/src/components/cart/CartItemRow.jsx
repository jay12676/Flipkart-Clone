import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatRupees } from '../../utils/format.js';

export default function CartItemRow({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  const setQty = async (next) => {
    if (next < 1 || next > 10 || next === item.quantity) return;
    setBusy(true);
    try {
      await updateQuantity(item.id, next);
    } catch (err) {
      push(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await removeItem(item.id);
      push('Removed from cart', { type: 'info' });
    } catch (err) {
      push(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-4 border-b border-flipBorder p-4 last:border-b-0">
      <Link
        to={`/p/${item.product_id}`}
        className="flex h-28 w-28 flex-shrink-0 items-center justify-center bg-white"
      >
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.product_name} className="max-h-full max-w-full object-contain" />
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
          <span className="text-base font-semibold text-flipText">{formatRupees(item.unit_price)}</span>
          {Number(item.mrp) > Number(item.unit_price) && (
            <>
              <span className="text-xs text-flipMuted line-through">{formatRupees(item.mrp)}</span>
              <span className="text-xs font-semibold text-flipGreen">{item.discount_percent}% off</span>
            </>
          )}
        </div>

        {!item.in_stock && (
          <span className="text-xs font-semibold text-flipOrange">Out of stock</span>
        )}

        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            {item.quantity > 1 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setQty(item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-flipBorder text-lg font-semibold text-flipText disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
            )}
            <span className="min-w-[28px] text-center text-sm font-semibold">{item.quantity}</span>
            <button
              type="button"
              disabled={busy || item.quantity >= 10 || item.quantity >= item.stock}
              onClick={() => setQty(item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-flipBorder text-lg font-semibold text-flipText disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-sm font-semibold uppercase tracking-wide text-flipText hover:text-flipBlue disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="hidden flex-shrink-0 text-right text-sm font-semibold text-flipText sm:block">
        {formatRupees(item.line_total)}
      </div>
    </div>
  );
}
