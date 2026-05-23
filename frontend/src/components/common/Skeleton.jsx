export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-flipBorder/60 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 bg-white p-4 shadow-card">
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  );
}
