import { Link } from 'react-router-dom';
import { formatRupees } from '../../utils/format.js';
import AssuredTag from '../common/AssuredTag.jsx';
import RatingBadge from '../common/RatingBadge.jsx';
import HeartButton from './HeartButton.jsx';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/p/${product.id}`}
      className="group flex flex-col gap-2 bg-white p-4 shadow-card transition hover:shadow-md"
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="h-full w-full object-contain transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-flipMuted">No image</div>
        )}
        <HeartButton
          productId={product.id}
          className="absolute right-1 top-1"
        />
      </div>

      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-flipText group-hover:text-flipBlue">
        {product.name}
      </h3>

      <div className="flex items-center gap-2">
        <RatingBadge rating={product.rating} />
        <span className="text-xs font-semibold text-flipMuted">
          ({Number(product.rating_count).toLocaleString('en-IN')})
        </span>
        {product.assured && <AssuredTag />}
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-base font-semibold text-flipText">{formatRupees(product.price)}</span>
        {Number(product.mrp) > Number(product.price) && (
          <>
            <span className="text-xs text-flipMuted line-through">{formatRupees(product.mrp)}</span>
            <span className="text-xs font-semibold text-flipGreen">
              {product.discount_percent}% off
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
