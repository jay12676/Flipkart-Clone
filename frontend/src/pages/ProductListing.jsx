import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import useDebounce from '../hooks/useDebounce.js';

export default function ProductListing() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const rawSearch = searchParams.get('q') || '';
  const search = useDebounce(rawSearch, 300);

  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts({ search, category: slug })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, slug]);

  const heading = slug
    ? `Showing ${data.total} results in ${slug}`
    : search
      ? `Showing ${data.total} results for "${search}"`
      : `${data.total} products`;

  return (
    <div className="mx-auto max-w-7xl px-2 py-4 md:px-4">
      <div className="mb-3 flex items-baseline justify-between bg-white px-4 py-3 shadow-card">
        <h2 className="text-base font-semibold text-flipText">{heading}</h2>
        {loading && <span className="text-xs text-flipMuted">Loading…</span>}
      </div>

      {error ? (
        <EmptyState
          title="Could not load products"
          description={error}
        />
      ) : !loading && data.items.length === 0 ? (
        <EmptyState
          title="No products found"
          description={search ? `Try a different search term.` : 'This category is empty.'}
        />
      ) : (
        <ProductGrid products={data.items} loading={loading} />
      )}
    </div>
  );
}
