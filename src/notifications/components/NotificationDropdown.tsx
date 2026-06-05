import { useState } from "react";
import authAPI from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";
import { NOTIFICATION_DEFAULT_PAGE_SIZE } from "../constants";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotificationNavigation,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks";
import type { NotificationDto } from "../types";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationItem } from "./NotificationItem";
import { NotificationLoadingState } from "./NotificationLoadingState";

type Props = {
  onClose: () => void;
};

export function NotificationDropdown({ onClose }: Props) {
  const isAuthenticated = authAPI.isAuthenticated();
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(
    null
  );
  const [deletingNotificationId, setDeletingNotificationId] = useState<
    string | null
  >(null);
  const [navigationFeedback, setNavigationFeedback] = useState<string | null>(
    null
  );

  const unread = useUnreadNotificationCount({ enabled: isAuthenticated });
  const list = useNotifications(1, NOTIFICATION_DEFAULT_PAGE_SIZE, {
    enabled: isAuthenticated,
  });

  const { navigateToNotification, isNavigating } = useNotificationNavigation({
    onNavigate: onClose,
    onSettled: () => setActiveNotificationId(null),
  });
  const markAllRead = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();

  const items = list.data?.items ?? [];
  const hasUnread = (unread.data ?? 0) > 0;
  const isMutating =
    isNavigating || markAllRead.isPending || remove.isPending;

  const listError = list.isError
    ? getApiErrorMessage(list.error, "Failed to load notifications.")
    : null;

  const mutationError =
    (markAllRead.isError &&
      getApiErrorMessage(markAllRead.error, "Failed to mark all as read.")) ||
    (remove.isError &&
      getApiErrorMessage(remove.error, "Failed to delete notification.")) ||
    null;

  const handleNavigate = (notification: NotificationDto) => {
    setNavigationFeedback(null);
    setActiveNotificationId(notification.notificationId);

    const result = navigateToNotification(notification);

    if (!result.navigated) {
      setNavigationFeedback(result.resolution.reason);
      setActiveNotificationId(null);
    }
  };

  const handleDelete = (notificationId: string) => {
    setDeletingNotificationId(notificationId);
    remove.mutate(
      { notificationId },
      {
        onSettled: () => setDeletingNotificationId(null),
      }
    );
  };

  const handleMarkAllRead = () => {
    if (!hasUnread || isMutating) {
      return;
    }

    markAllRead.mutate();
  };

  return (
    <div className="absolute right-0 z-50 mt-3 w-72 space-y-3 rounded-2xl border bg-white p-4 shadow-lg md:w-80 md:p-6 lg:w-96">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slateInk md:text-base lg:text-lg">
          Notifications
        </h4>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={!hasUnread || isMutating}
          className="shrink-0 text-xs font-medium text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:text-gray-400 md:text-sm"
        >
          Mark all as read
        </button>
      </div>

      {(listError || mutationError || navigationFeedback) && (
        <p
          className={`rounded-lg px-3 py-2 text-xs ${
            listError || mutationError
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {listError ?? mutationError ?? navigationFeedback}
        </p>
      )}

      <div className="max-h-60 space-y-2 overflow-y-auto">
        {list.isLoading && <NotificationLoadingState />}

        {!list.isLoading && !listError && items.length === 0 && (
          <NotificationEmptyState />
        )}

        {!list.isLoading &&
          !listError &&
          items.map((notification) => (
            <NotificationItem
              key={notification.notificationId}
              notification={notification}
              onNavigate={handleNavigate}
              onDelete={handleDelete}
              isNavigating={
                isNavigating &&
                activeNotificationId === notification.notificationId
              }
              isDeleting={
                remove.isPending &&
                deletingNotificationId === notification.notificationId
              }
            />
          ))}
      </div>
    </div>
  );
}
