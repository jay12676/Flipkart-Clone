import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../api/orders.js';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { formatRupees } from '../utils/format.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOrders()
      .then((data) => !cancelled && setOrders(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 p-2 md:p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-4">
        <EmptyState title="Could not load orders" description={error} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-5xl p-4">
        <EmptyState
          title="No orders yet"
          description="Once you place an order it'll show up here."
          action={
            <Link
              to="/"
              className="mt-2 inline-block bg-flipBlue px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Start shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-2 md:p-4">
      <header className="mb-3 flex items-baseline justify-between bg-white px-4 py-3 shadow-card">
        <h1 className="text-base font-semibold text-flipText">My Orders</h1>
        <span className="text-xs font-semibold text-flipMuted">
          {orders.length} order{orders.length === 1 ? '' : 's'}
        </span>
      </header>

      <ul className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>
    </div>
  );
}

function OrderCard({ order }) {
  const placedOn = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <li className="bg-white p-4 shadow-card md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-flipBorder pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-flipMuted">Order ID</p>
          <p className="break-all text-sm font-semibold text-flipBlue">{order.order_number}</p>
        </div>
        <div className="text-right">
          <StatusPill status={order.status} />
          <p className="mt-1 text-xs text-flipMuted">Placed on {placedOn}</p>
        </div>
      </div>

      <ul className="my-3 divide-y divide-flipBorder">
        {order.items.map((i) => (
          <li
            key={i.id}
            className="flex items-baseline justify-between gap-2 py-2 text-sm"
          >
            <span className="flex-1 text-flipText">
              {i.product_name}{' '}
              <span className="text-flipMuted">× {i.quantity}</span>
            </span>
            <span className="font-semibold">{formatRupees(i.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-flipBorder pt-3">
        <div className="text-sm">
          <span className="text-flipMuted">{itemCount} item{itemCount === 1 ? '' : 's'} · Total: </span>
          <span className="text-base font-semibold text-flipText">
            {formatRupees(order.total)}
          </span>
        </div>
        <Link
          to={`/order/${order.order_number}`}
          className="text-sm font-semibold uppercase tracking-wide text-flipBlue hover:underline"
        >
          View details →
        </Link>
      </div>
    </li>
  );
}

const STATUS_STYLES = {
  PLACED: 'bg-flipGreen text-white',
  SHIPPED: 'bg-flipBlue text-white',
  DELIVERED: 'bg-flipGreen text-white',
  CANCELLED: 'bg-flipOrange text-white',
};

function StatusPill({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-flipMuted text-white';
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}
