import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { placeOrder } from '../api/orders.js';
import CartSummary from '../components/cart/CartSummary.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { sendOrderConfirmation } from '../services/email.js';
import { formatRupees } from '../utils/format.js';

const initial = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
};

function validate(values) {
  const errors = {};
  if (values.full_name.trim().length < 2) errors.full_name = 'Enter your full name';
  if (!/^\d{10}$/.test(values.phone.replace(/\D/g, '')))
    errors.phone = 'Enter a valid 10-digit mobile number';
  if (values.address_line1.trim().length < 3) errors.address_line1 = 'Address is too short';
  if (values.city.trim().length < 2) errors.city = 'Enter a city';
  if (values.state.trim().length < 2) errors.state = 'Enter a state';
  if (!/^\d{6}$/.test(values.pincode)) errors.pincode = 'Pincode must be 6 digits';
  return errors;
}

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <EmptyState
          title="Nothing to checkout"
          description="Your cart is empty."
        />
      </div>
    );
  }

  const setField = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const setDigits = (field, maxDigits) => (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
    setValues((v) => ({ ...v, [field]: cleaned }));
  };

  const FIELD_ORDER = [
    'full_name', 'phone', 'address_line1', 'city', 'state', 'pincode',
  ];

  const focusFirstError = (errs) => {
    const firstBad = FIELD_ORDER.find((f) => errs[f]);
    if (!firstBad) return;
    const el = document.getElementById(`checkout-${firstBad}`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.focus({ preventScroll: true });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      focusFirstError(v);
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder(values);
      await refresh();

      // eslint-disable-next-line no-console
      console.log('[checkout] firing EmailJS to', user?.email);
      sendOrderConfirmation({ toEmail: user?.email, order })
        .then((result) => {
          // eslint-disable-next-line no-console
          console.log('[checkout] EmailJS result:', result);
          if (result.ok) {
            push(`Confirmation email sent to ${user.email}`, { type: 'info' });
          } else {
            push(`Email skipped: ${result.reason}`, { type: 'error' });
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[checkout] EmailJS threw', err);
          push(`Email failed: ${err.message}`, { type: 'error' });
        });

      navigate(`/order/${order.order_number}`, { replace: true });
    } catch (err) {
      push(err.message, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-4 p-2 md:grid-cols-[1fr_360px] md:p-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <section className="bg-white p-5 shadow-card">
          <h2 className="mb-4 text-base font-semibold text-flipText">Shipping Address</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Full Name" error={errors.full_name}>
              <input
                id="checkout-full_name"
                value={values.full_name}
                onChange={setField('full_name')}
                className={inputClass(errors.full_name)}
                autoComplete="name"
              />
            </Field>
            <Field label="10-digit Mobile Number" error={errors.phone}>
              <input
                id="checkout-phone"
                value={values.phone}
                onChange={setDigits('phone', 10)}
                className={inputClass(errors.phone)}
                inputMode="numeric"
                autoComplete="tel"
              />
            </Field>
            <Field label="Address (House No., Street)" error={errors.address_line1} full>
              <input
                id="checkout-address_line1"
                value={values.address_line1}
                onChange={setField('address_line1')}
                className={inputClass(errors.address_line1)}
                autoComplete="address-line1"
              />
            </Field>
            <Field label="Landmark (Optional)" full>
              <input
                value={values.address_line2}
                onChange={setField('address_line2')}
                className={inputClass(false)}
                autoComplete="address-line2"
              />
            </Field>
            <Field label="City" error={errors.city}>
              <input
                id="checkout-city"
                value={values.city}
                onChange={setField('city')}
                className={inputClass(errors.city)}
                autoComplete="address-level2"
              />
            </Field>
            <Field label="State" error={errors.state}>
              <input
                id="checkout-state"
                value={values.state}
                onChange={setField('state')}
                className={inputClass(errors.state)}
                autoComplete="address-level1"
              />
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input
                id="checkout-pincode"
                value={values.pincode}
                onChange={setDigits('pincode', 6)}
                className={inputClass(errors.pincode)}
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </Field>
          </div>
        </section>

        <section className="bg-white p-5 shadow-card">
          <h2 className="mb-3 text-base font-semibold text-flipText">Order Summary</h2>
          <div className="divide-y divide-flipBorder">
            {cart.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="flex-1 line-clamp-1 text-flipText">
                  {i.product_name} <span className="text-flipMuted">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatRupees(i.line_total)}</span>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="bg-flipOrange px-12 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow disabled:opacity-50"
        >
          {submitting ? 'Placing Order…' : `Place Order — ${formatRupees(cart.total)}`}
        </button>
      </form>

      <CartSummary cart={cart} />
    </div>
  );
}

function Field({ label, error, full, children }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-flipMuted">{label}</span>
      {children}
      {error && <span className="text-xs text-flipOrange">{error}</span>}
    </label>
  );
}

function inputClass(hasError) {
  return `h-10 rounded border bg-white px-3 text-sm outline-none ${
    hasError ? 'border-flipOrange' : 'border-flipBorder focus:border-flipBlue'
  }`;
}
