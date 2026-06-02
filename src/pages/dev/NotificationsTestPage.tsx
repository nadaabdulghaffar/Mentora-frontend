import { useEffect, useState } from "react";
import {
  NOTIFICATION_DEFAULT_PAGE_SIZE,
} from "../../notifications/constants";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../../notifications/hooks";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";

type MutationFeedback = {
  action: string;
  message: string;
};

export default function NotificationsTestPage() {
  const [feedback, setFeedback] = useState<MutationFeedback | null>(null);

  const unread = useUnreadNotificationCount();
  const list = useNotifications(1, NOTIFICATION_DEFAULT_PAGE_SIZE);

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();

  const firstNotification = list.data?.items[0];
  const firstId = firstNotification?.notificationId;

  useEffect(() => {
    if (markRead.isSuccess) {
      setFeedback({ action: "markRead", message: "Marked notification as read." });
    }
  }, [markRead.isSuccess]);

  useEffect(() => {
    if (markAllRead.isSuccess) {
      setFeedback({ action: "markAllRead", message: "Marked all notifications as read." });
    }
  }, [markAllRead.isSuccess]);

  useEffect(() => {
    if (remove.isSuccess) {
      setFeedback({ action: "delete", message: "Deleted notification." });
    }
  }, [remove.isSuccess]);

  const queryError =
    (unread.isError && getApiErrorMessage(unread.error, "Failed to load unread count.")) ||
    (list.isError && getApiErrorMessage(list.error, "Failed to load notifications.")) ||
    null;

  const mutationError =
    (markRead.isError &&
      getApiErrorMessage(markRead.error, "Failed to mark as read.")) ||
    (markAllRead.isError &&
      getApiErrorMessage(markAllRead.error, "Failed to mark all as read.")) ||
    (remove.isError && getApiErrorMessage(remove.error, "Failed to delete notification.")) ||
    null;

  const isMutating =
    markRead.isPending || markAllRead.isPending || remove.isPending;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 720 }}>
      <h1>Notifications — Dev Test</h1>
      <p style={{ color: "#666" }}>
        Temporary page for Phase 2/3 validation. Requires login (JWT in localStorage).
      </p>

      <section style={{ marginTop: 24 }}>
        <h2>Unread count</h2>
        {unread.isLoading && <p>Loading unread count…</p>}
        {unread.isFetching && !unread.isLoading && <p>Refetching unread count…</p>}
        {!unread.isLoading && (
          <p>
            <strong>Count:</strong> {unread.data ?? 0}
          </p>
        )}
        <button
          type="button"
          disabled={unread.isFetching}
          onClick={() => unread.refetch()}
        >
          Refetch unread count
        </button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Notifications (page 1)</h2>
        {list.isLoading && <p>Loading notifications…</p>}
        {list.isFetching && !list.isLoading && <p>Refetching notifications…</p>}
        {!list.isLoading && (
          <p>
            <strong>Items on page:</strong> {list.data?.items.length ?? 0} / pageSize{" "}
            {list.data?.pageSize ?? NOTIFICATION_DEFAULT_PAGE_SIZE}
          </p>
        )}
        <button
          type="button"
          disabled={list.isFetching}
          onClick={() => list.refetch()}
          style={{ marginBottom: 12 }}
        >
          Refetch notifications
        </button>

        {list.data && list.data.items.length === 0 && (
          <p>No notifications on page 1.</p>
        )}

        <ul style={{ paddingLeft: 20 }}>
          {list.data?.items.map((item) => (
            <li key={item.notificationId} style={{ marginBottom: 8 }}>
              <strong>{item.isRead ? "[read]" : "[unread]"}</strong> {item.title}
              <br />
              <small>{item.message}</small>
              <br />
              <small>id: {item.notificationId}</small>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Mutations</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            disabled={!firstId || isMutating}
            onClick={() => {
              setFeedback(null);
              markRead.reset();
              if (firstId) {
                markRead.mutate({ notificationId: firstId });
              }
            }}
          >
            Mark first as read
          </button>
          <button
            type="button"
            disabled={isMutating}
            onClick={() => {
              setFeedback(null);
              markAllRead.reset();
              markAllRead.mutate();
            }}
          >
            Mark all as read
          </button>
          <button
            type="button"
            disabled={!firstId || isMutating}
            onClick={() => {
              setFeedback(null);
              remove.reset();
              if (firstId) {
                remove.mutate({ notificationId: firstId });
              }
            }}
          >
            Delete first notification
          </button>
        </div>
        {isMutating && <p style={{ marginTop: 8 }}>Mutation in progress…</p>}
        {firstId && (
          <p style={{ marginTop: 8, fontSize: 14, color: "#444" }}>
            First item id: <code>{firstId}</code>
            {firstNotification && ` (${firstNotification.isRead ? "read" : "unread"})`}
          </p>
        )}
        {!firstId && !list.isLoading && (
          <p style={{ marginTop: 8, color: "#666" }}>
            No first item — mark/delete buttons disabled.
          </p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Status</h2>
        {queryError && (
          <p style={{ color: "#b00020" }}>
            <strong>Query error:</strong> {queryError}
          </p>
        )}
        {mutationError && (
          <p style={{ color: "#b00020" }}>
            <strong>Mutation error:</strong> {mutationError}
          </p>
        )}
        {feedback && !mutationError && (
          <p style={{ color: "#0a7c42" }}>
            <strong>Success ({feedback.action}):</strong> {feedback.message}
          </p>
        )}
        {!queryError && !mutationError && !feedback && !isMutating && (
          <p style={{ color: "#666" }}>No errors. Run a mutation to see success feedback.</p>
        )}
      </section>
    </main>
  );
}
