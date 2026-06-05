import { useNotificationRealtime } from "../hooks/useNotificationRealtime";

/** Headless app-level bridge for notification realtime updates. */
export function NotificationRealtimeBridge() {
  useNotificationRealtime();
  return null;
}
