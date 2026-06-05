import { Bell } from "lucide-react";

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Bell size={18} aria-hidden />
      </div>
      <p className="text-sm font-medium text-slateInk">No notifications yet</p>
      <p className="mt-1 text-xs text-gray-400">
        You&apos;re all caught up. New updates will appear here.
      </p>
    </div>
  );
}
