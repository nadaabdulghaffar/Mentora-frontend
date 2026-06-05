import { Trash2 } from "lucide-react";
import type { NotificationDto } from "../types";
import { formatNotificationTimestamp } from "../utils/formatNotificationTimestamp";

type Props = {
  notification: NotificationDto;
  onNavigate: (notification: NotificationDto) => void;
  onDelete: (notificationId: string) => void;
  isNavigating: boolean;
  isDeleting: boolean;
};

export function NotificationItem({
  notification,
  onNavigate,
  onDelete,
  isNavigating,
  isDeleting,
}: Props) {
  const isBusy = isNavigating || isDeleting;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isBusy) {
          onNavigate(notification);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!isBusy) {
            onNavigate(notification);
          }
        }
      }}
      className={`group flex cursor-pointer gap-2 rounded-xl p-3 transition ${
        notification.isRead
          ? "hover:bg-gray-100"
          : "bg-purple-50 hover:bg-purple-100/80"
      } ${isBusy ? "pointer-events-none opacity-60" : ""}`}
      aria-label={`${notification.isRead ? "Read" : "Unread"} notification: ${notification.title}`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm text-slateInk ${
            notification.isRead ? "font-medium" : "font-semibold"
          }`}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {formatNotificationTimestamp(notification.createdAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (!isBusy) {
            onDelete(notification.notificationId);
          }
        }}
        className="shrink-0 self-start rounded-lg p-1.5 text-gray-400 transition hover:bg-white hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
        aria-label={`Delete notification: ${notification.title}`}
        disabled={isBusy}
      >
        <Trash2 size={14} aria-hidden />
      </button>
    </div>
  );
}
