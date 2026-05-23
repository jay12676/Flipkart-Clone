import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrder } from '../api/orders.js';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { formatRupees } from '../utils/format.js';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOrder(orderNumber)
      .then((o) => !cancelled && setOrder(o))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <EmptyState title="Order not found" description={error || ''} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-2 md:p-4">
      <div className="flex flex-col items-center bg-white p-8 text-center shadow-card">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-flipGreen text-white">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-flipText">Order Placed Successfully</h1>
        <p className="mt-1 text-sm text-flipMuted">Thank you for shopping with us.</p>

        <div className="mt-6 w-full rounded border border-flipBorder bg-flipBg px-6 py-4 text-left">
          <p className="text-xs uppercase tracking-wide text-flipMuted">Order ID</p>
          <p className="break-all text-lg font-semibold text-flipBlue">{order.order_number}</p>
        </div>

        <div className="mt-6 w-full text-left">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-flipMuted">
            Items
          </h3>
          <ul className="divide-y divide-flipBorder">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="flex-1 text-flipText">
                  {i.product_name} <span className="text-flipMuted">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatRupees(i.line_total)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 w-full rounded border border-flipBorder px-4 py-3 text-left text-sm">
          <p className="font-semibold text-flipText">Shipping to</p>
          <p className="text-flipMuted">
            {order.full_name}
            <br />
            {order.address_line1}
            {order.address_line2 ? `, ${order.address_line2}` : ''}
            <br />
            {order.city}, {order.state} — {order.pincode}
            <br />
            Phone: {order.phone}
          </p>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-2 text-sm">
          <div className="rounded border border-flipBorder px-4 py-3 text-left">
            <span className="text-flipMuted">Subtotal</span>
            <p className="font-semibold">{formatRupees(order.subtotal)}</p>
          </div>
          <div className="rounded border border-flipBorder px-4 py-3 text-left">
            <span className="text-flipMuted">Total Paid</span>
            <p className="text-lg font-semibold text-flipGreen">{formatRupees(order.total)}</p>
          </div>
        </div>

        <Link
          to="/"
          className="mt-6 inline-block bg-flipBlue px-8 py-2.5 text-sm font-semibold uppercase tracking-wide text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
