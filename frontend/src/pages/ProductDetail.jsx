import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProduct } from '../api/products.js';
import AssuredTag from '../components/common/AssuredTag.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import RatingBadge from '../components/common/RatingBadge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import HeartButton from '../components/product/HeartButton.jsx';
import ImageCarousel from '../components/product/ImageCarousel.jsx';
import SpecsTable from '../components/product/SpecsTable.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatRupees } from '../utils/format.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { push } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProduct(id)
      .then((p) => !cancelled && setProduct(p))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onAddToCart = async () => {
    setBusy(true);
    try {
      await addItem(product.id, 1);
      push('Added to cart');
    } catch (err) {
      push(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const onBuyNow = async () => {
    setBusy(true);
    try {
      await addItem(product.id, 1);
      navigate('/checkout');
    } catch (err) {
      push(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[420px_1fr]">
        <Skeleton className="h-96" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <EmptyState title="Product not found" description={error || 'It may have been removed.'} />
      </div>
    );
  }

  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;
  const specs = [
    { label: 'Brand', value: product.brand },
    { label: 'Availability', value: outOfStock ? 'Out of stock' : `${product.stock} in stock` },
    { label: 'Rating', value: `${Number(product.rating).toFixed(1)} (${Number(product.rating_count).toLocaleString('en-IN')} ratings)` },
    { label: 'Assured', value: product.assured ? 'Flipkart Assured' : 'Standard listing' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-2 py-4 md:px-4">
      <div className="grid gap-6 bg-white p-4 shadow-card md:grid-cols-[420px_1fr]">
        <div className="md:sticky md:top-32 md:self-start">
          <ImageCarousel images={product.images} />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={busy || outOfStock}
              className="flex-1 bg-flipYellow py-3 text-sm font-semibold uppercase tracking-wide text-white shadow disabled:opacity-50"
            >
              {outOfStock ? 'Out of stock' : 'Add to Cart'}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              disabled={busy || outOfStock}
              className="flex-1 bg-flipOrange py-3 text-sm font-semibold uppercase tracking-wide text-white shadow disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-flipMuted">{product.brand}</p>
            <HeartButton productId={product.id} size="lg" />
          </div>
          <h1 className="text-xl font-medium text-flipText md:text-2xl">{product.name}</h1>

          <div className="flex items-center gap-2">
            <RatingBadge rating={product.rating} />
            <span className="text-xs font-semibold text-flipMuted">
              {Number(product.rating_count).toLocaleString('en-IN')} Ratings
            </span>
            {product.assured && <AssuredTag />}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-medium text-flipText">{formatRupees(product.price)}</span>
            {Number(product.mrp) > Number(product.price) && (
              <>
                <span className="text-base text-flipMuted line-through">{formatRupees(product.mrp)}</span>
                <span className="text-base font-semibold text-flipGreen">
                  {product.discount_percent}% off
                </span>
              </>
            )}
          </div>

          {lowStock && (
            <span className="text-sm font-semibold text-flipOrange">
              Hurry, only {product.stock} left!
            </span>
          )}
          {outOfStock && (
            <span className="text-sm font-semibold text-flipOrange">Currently unavailable</span>
          )}

          <p className="text-sm leading-relaxed text-flipText">{product.description}</p>

          <div className="mt-4">
            <h2 className="mb-2 text-base font-semibold text-flipText">Specifications</h2>
            <SpecsTable rows={specs} />
          </div>
        </div>
      </div>
    </div>
  );
}
