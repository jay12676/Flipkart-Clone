export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 bg-white p-12 text-center shadow-card">
      <div className="text-5xl">🛒</div>
      <h3 className="text-lg font-semibold text-flipText">{title}</h3>
      {description && <p className="max-w-md text-sm text-flipMuted">{description}</p>}
      {action}
    </div>
  );
}
