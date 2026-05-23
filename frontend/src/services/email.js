import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const ENABLED = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

if (!ENABLED) {
  // eslint-disable-next-line no-console
  console.warn('[email] EmailJS not configured — order emails will be skipped.');
}

function formatItems(items) {
  return items
    .map((i) => `  • ${i.product_name} × ${i.quantity}  —  Rs ${i.line_total}`)
    .join('\n');
}

export async function sendOrderConfirmation({ toEmail, order }) {
  if (!ENABLED) {
    return { ok: false, reason: 'EmailJS not configured' };
  }
  if (!toEmail) {
    return { ok: false, reason: 'No recipient email' };
  }

  const variables = {
    to_email: toEmail,
    to_name: toEmail.split('@')[0],
    order_number: order.order_number,
    order_total: String(order.total),
    order_items: formatItems(order.items),
    shipping_name: order.full_name,
    shipping_address:
      order.address_line2
        ? `${order.address_line1}, ${order.address_line2}`
        : order.address_line1,
    shipping_city: order.city,
    shipping_state: order.state,
    shipping_pincode: order.pincode,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, variables, {
      publicKey: PUBLIC_KEY,
    });
    return { ok: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email] EmailJS send failed', err);
    return { ok: false, reason: err?.text || err?.message || 'Unknown error' };
  }
}
