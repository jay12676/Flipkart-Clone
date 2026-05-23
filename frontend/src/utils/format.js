const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatRupees(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '';
  return rupeeFormatter.format(num);
}

export function computeDiscount(price, mrp) {
  const p = Number(price);
  const m = Number(mrp);
  if (!m || m <= 0 || p >= m) return 0;
  return Math.round(((m - p) / m) * 100);
}
