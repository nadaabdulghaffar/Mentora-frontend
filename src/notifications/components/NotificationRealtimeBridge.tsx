import { useEffect, useRef } from "react";
import { useNotificationRealtime } from "../hooks/useNotificationRealtime";

/** Headless app-level bridge for notification realtime updates. */
export function NotificationRealtimeBridge() {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log(`[NotificationRealtimeBridge] RENDER #${renderCountRef.current}`);

  useEffect(() => {
    console.log("[NotificationRealtimeBridge] MOUNT");
    return () => {
      console.log("[NotificationRealtimeBridge] UNMOUNT");
    };
  }, []);

  useNotificationRealtime();
  return null;
}
