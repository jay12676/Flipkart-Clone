import { formatRupees } from '../../utils/format.js';

export default function CartSummary({ cart, action }) {
  const totalMrp = cart.items.reduce(
    (sum, i) => sum + Number(i.mrp) * i.quantity,
    0
  );
  const youSave = Math.max(0, totalMrp - Number(cart.subtotal));

  return (
    <aside className="sticky top-32 flex flex-col gap-3 bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-flipMuted">
        Price Details
      </h3>
      <Row
        label={`Price (${cart.item_count} item${cart.item_count === 1 ? '' : 's'})`}
        value={formatRupees(totalMrp)}
      />
      <Row label="Discount" value={`− ${formatRupees(youSave)}`} valueClass="text-flipGreen" />
      <Row
        label="Delivery Charges"
        value={Number(cart.shipping_fee) === 0 ? 'FREE' : formatRupees(cart.shipping_fee)}
        valueClass={Number(cart.shipping_fee) === 0 ? 'text-flipGreen' : ''}
      />
      <hr className="border-dashed border-flipBorder" />
      <Row label="Total Amount" value={formatRupees(cart.total)} bold />
      {youSave > 0 && (
        <p className="text-sm font-semibold text-flipGreen">
          You will save {formatRupees(youSave)} on this order
        </p>
      )}
      {action}
    </aside>
  );
}

function Row({ label, value, valueClass = '', bold = false }) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${bold ? 'text-base font-semibold' : ''}`}
    >
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
