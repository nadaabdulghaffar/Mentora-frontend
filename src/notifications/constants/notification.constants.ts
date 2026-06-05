import { ReferenceType } from "../types/notification.enums";

/** Default `page` for `GET /api/notifications`. */
export const NOTIFICATION_DEFAULT_PAGE = 1;

/** Default `pageSize` for `GET /api/notifications` (backend default: 20). */
export const NOTIFICATION_DEFAULT_PAGE_SIZE = 20;

/** Backend clamps `pageSize` to 1..50. */
export const NOTIFICATION_MIN_PAGE_SIZE = 1;
export const NOTIFICATION_MAX_PAGE_SIZE = 50;

/** REST paths relative to the API client base URL (`/api`). */
export const NOTIFICATION_API_PATHS = {
  list: "/notifications",
  unreadCount: "/notifications/unread-count",
  markRead: (notificationId: string) =>
    `/notifications/${notificationId}/read`,
  markAllRead: "/notifications/read-all",
  delete: (notificationId: string) => `/notifications/${notificationId}`,
} as const;

/** SignalR hub route (append to backend origin, not API base). */
export const NOTIFICATION_HUB_PATH = "/hubs/notifications";

/** SignalR client event emitted by the backend publisher. */
export const NOTIFICATION_SIGNALR_EVENT = "ReceiveNotification";

/**
 * Suggested frontend route templates per `ReferenceType`.
 * Verify against app routes before navigation (see integration doc).
 */
export const REFERENCE_TYPE_ROUTE_TEMPLATE: Record<
  (typeof ReferenceType)[keyof typeof ReferenceType],
  string
> = {
  [ReferenceType.Program]: "/programs/:id",
  [ReferenceType.Application]: "/applications/:id",
  [ReferenceType.Submission]: "/classroom/submissions/:id",
  [ReferenceType.ClassroomPost]: "/classroom/posts/:id",
  [ReferenceType.CommunityPost]: "/community/posts/:id",
  [ReferenceType.Conversation]: "/messages/conversations/:id",
  [ReferenceType.UserProfile]: "/profile/:id",
  [ReferenceType.Feedback]: "/feedback/:id",
};

/** Used when a notification has no resolvable deep link. */
export const NOTIFICATION_NAVIGATION_FALLBACK_ROUTE = "/dashboard";
