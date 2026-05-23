export default function RatingBadge({ rating }) {
  if (rating == null) return null;
  return (
    <span className="inline-flex items-center gap-0.5 rounded-sm bg-flipGreen px-1.5 py-0.5 text-xs font-semibold text-white">
      {Number(rating).toFixed(1)}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </span>
  );
}
