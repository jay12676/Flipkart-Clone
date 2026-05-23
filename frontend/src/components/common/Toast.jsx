const styles = {
  success: 'bg-flipText',
  error: 'bg-flipOrange',
  info: 'bg-flipBlue',
};

export default function Toast({ type = 'success', message }) {
  return (
    <div
      role="status"
      className={`pointer-events-auto rounded px-4 py-2 text-sm font-medium text-white shadow-lg ${styles[type] || styles.success}`}
    >
      {message}
    </div>
  );
}
