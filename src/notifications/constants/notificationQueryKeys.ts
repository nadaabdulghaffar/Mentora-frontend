/**
 * React Query keys for the notifications module.
 * @see docs/Notifications-Backend-Integration-Documentation.md — React Query Cache Strategy
 */
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (page: number, pageSize: number) =>
    [...notificationKeys.lists(), page, pageSize] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
  detail: (notificationId: string) =>
    [...notificationKeys.all, "detail", notificationId] as const,
};
