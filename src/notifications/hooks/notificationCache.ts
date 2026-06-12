import type { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  NOTIFICATION_MAX_PAGE_SIZE,
  NOTIFICATION_MIN_PAGE_SIZE,
  notificationKeys,
} from "../constants";
import type { NotificationDto, NotificationPagedResult } from "../types";

export function clampNotificationPageSize(pageSize: number): number {
  return Math.min(
    Math.max(pageSize, NOTIFICATION_MIN_PAGE_SIZE),
    NOTIFICATION_MAX_PAGE_SIZE
  );
}

export type NotificationListQueriesSnapshot = Array<
  [QueryKey, NotificationPagedResult | undefined]
>;

export async function cancelNotificationQueries(
  queryClient: QueryClient
): Promise<void> {
  await queryClient.cancelQueries({ queryKey: notificationKeys.all });
}

export function snapshotUnreadCount(
  queryClient: QueryClient
): number | undefined {
  return queryClient.getQueryData<number>(notificationKeys.unreadCount());
}

export function snapshotListQueries(
  queryClient: QueryClient
): NotificationListQueriesSnapshot {
  return queryClient.getQueriesData<NotificationPagedResult>({
    queryKey: notificationKeys.lists(),
  });
}

export function restoreUnreadCount(
  queryClient: QueryClient,
  previous: number | undefined
): void {
  queryClient.setQueryData(notificationKeys.unreadCount(), previous);
}

export function restoreListQueries(
  queryClient: QueryClient,
  snapshot: NotificationListQueriesSnapshot
): void {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
}

export function markNotificationReadInLists(
  queryClient: QueryClient,
  notificationId: string
): boolean {
  let wasUnread = false;

  queryClient.setQueriesData<NotificationPagedResult>(
    { queryKey: notificationKeys.lists() },
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) => {
          if (item.notificationId !== notificationId) {
            return item;
          }

          if (!item.isRead) {
            wasUnread = true;
          }

          return { ...item, isRead: true };
        }),
      };
    }
  );

  return wasUnread;
}

export function markAllNotificationsReadInLists(
  queryClient: QueryClient
): void {
  queryClient.setQueriesData<NotificationPagedResult>(
    { queryKey: notificationKeys.lists() },
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) => ({ ...item, isRead: true })),
      };
    }
  );
}

export function removeNotificationFromLists(
  queryClient: QueryClient,
  notificationId: string
): boolean {
  let wasUnread = false;

  queryClient.setQueriesData<NotificationPagedResult>(
    { queryKey: notificationKeys.lists() },
    (current) => {
      if (!current) {
        return current;
      }

      const removed = current.items.find(
        (item) => item.notificationId === notificationId
      );

      if (removed && !removed.isRead) {
        wasUnread = true;
      }

      return {
        ...current,
        items: current.items.filter(
          (item) => item.notificationId !== notificationId
        ),
        totalCount: Math.max(0, current.totalCount - (removed ? 1 : 0)),
      };
    }
  );

  return wasUnread;
}

export function adjustUnreadCount(
  queryClient: QueryClient,
  delta: number
): void {
  queryClient.setQueryData<number>(notificationKeys.unreadCount(), (current) =>
    Math.max(0, (current ?? 0) + delta)
  );
}

export function prependNotificationToLists(
  queryClient: QueryClient,
  notification: NotificationDto
): boolean {
  let inserted = false;

  queryClient.setQueriesData<NotificationPagedResult>(
    { queryKey: notificationKeys.lists() },
    (current) => {
      if (!current) {
        return current;
      }

      const alreadyExists = current.items.some(
        (item) => item.notificationId === notification.notificationId
      );

      if (alreadyExists) {
        return current;
      }

      inserted = true;

      return {
        ...current,
        items: [notification, ...current.items].slice(0, current.pageSize),
        totalCount: current.totalCount + 1,
      };
    }
  );

  return inserted;
}

export function applyRealtimeNotification(
  queryClient: QueryClient,
  notification: NotificationDto
): void {
  // Ignore chat messages in the generic notification UI
  if (notification.type === 13) { // NotificationType.NewMessage
    return;
  }

  const inserted = prependNotificationToLists(queryClient, notification);

  if (inserted && !notification.isRead) {
    adjustUnreadCount(queryClient, 1);
  }
}

export function invalidateNotificationUnreadCount(
  queryClient: QueryClient
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: notificationKeys.unreadCount(),
  });
}

export function invalidateNotificationLists(
  queryClient: QueryClient
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: notificationKeys.lists(),
  });
}
