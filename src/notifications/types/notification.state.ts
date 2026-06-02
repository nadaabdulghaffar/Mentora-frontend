import type { NotificationDto } from "./notification.dto";

/** SignalR connection state for the notifications hub (frontend-only). */
export type NotificationConnectionState =
  | "connected"
  | "connecting"
  | "disconnected"
  | "reconnecting";

/** Local UI state shape described in the integration guide. */
export interface NotificationListState {
  notifications: NotificationDto[];
  unreadCount: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  selectedNotificationId?: string;
  isLoadingPage?: boolean;
  isCountLoading?: boolean;
  connectionState?: NotificationConnectionState;
}
