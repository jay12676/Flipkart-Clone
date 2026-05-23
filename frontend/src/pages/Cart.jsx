import { Link, useNavigate } from 'react-router-dom';
import CartItemRow from '../components/cart/CartItemRow.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { cart, loading } = useCart();
  const navigate = useNavigate();

  if (loading && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <EmptyState
          title="Your cart is empty"
          description="Add items to it now."
          action={
            <Link
              to="/"
              className="mt-2 inline-block bg-flipBlue px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Shop now
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 p-2 md:grid-cols-[1fr_360px] md:p-4">
      <section className="bg-white shadow-card">
        <header className="border-b border-flipBorder p-4 text-base font-semibold text-flipText">
          My Cart ({cart.item_count})
        </header>
        <div className="flex flex-col">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
        <div className="flex justify-end border-t border-flipBorder bg-white p-4">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            disabled={cart.items.some((i) => !i.in_stock)}
            className="bg-flipOrange px-12 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow disabled:opacity-50"
          >
            Place Order
          </button>
        </div>
      </section>

      <CartSummary cart={cart} />
    </div>
  );
}
