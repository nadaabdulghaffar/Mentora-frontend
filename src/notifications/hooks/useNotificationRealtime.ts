import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import authAPI from "../../services/authService";
import { notificationSignalR } from "../services/notificationSignalR";
import {
  applyRealtimeNotification,
  invalidateNotificationLists,
  invalidateNotificationUnreadCount,
} from "./notificationCache";

/**
 * Maintains the notifications SignalR connection for authenticated sessions.
 * Mount once at app level (see `NotificationRealtimeBridge`).
 */
export function useNotificationRealtime() {
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    const unsubscribeReceive = notificationSignalR.onReceiveNotification(
      (notification) => {
        applyRealtimeNotification(queryClient, notification);
      }
    );

    const unsubscribeReconnected = notificationSignalR.onReconnected(() => {
      void Promise.all([
        invalidateNotificationUnreadCount(queryClient),
        invalidateNotificationLists(queryClient),
      ]);
    });

    return () => {
      unsubscribeReceive();
      unsubscribeReconnected();
    };
  }, [queryClient]);

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      void notificationSignalR.disconnect();
      return;
    }

    void notificationSignalR.connect().catch((error) => {
      console.error("[NotificationHub] connect failed", error);
    });
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      void notificationSignalR.disconnect();
    };
  }, []);
}
