export function NotificationLoadingState() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading notifications">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl bg-gray-100 p-3"
        >
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-2 h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-1/4 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
