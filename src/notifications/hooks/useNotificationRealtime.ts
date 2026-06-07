import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import authAPI from "../../services/authService";
import { notificationSignalR } from "../services/notificationSignalR";
import {
  applyRealtimeNotification,
  invalidateNotificationLists,
  invalidateNotificationUnreadCount,
} from "./notificationCache";

// ── Diagnostic helpers ────────────────────────────────────────────
let hookRenderCount = 0;
let reconnectInvalidationCount = 0;
let connectEffectFireCount = 0;
// ─────────────────────────────────────────────────────────────────

const PAGE_NAME = "NotificationRealtime";

/**
 * Maintains the notifications SignalR connection for authenticated sessions.
 * Mount once at app level (see `NotificationRealtimeBridge`).
 */
export function useNotificationRealtime() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const handlersEffectRunRef = useRef(0);
  const connectEffectRunRef = useRef(0);
  const unmountEffectRunRef = useRef(0);
  const renderRef = useRef(0);

  // ── Diagnostic: track hook render count and queryClient identity ──
  renderRef.current += 1;
  hookRenderCount += 1;
  console.log(
    `[${PAGE_NAME}] HOOK RENDER #${renderRef.current} (global #${hookRenderCount}) ` +
    `queryClient_id=${(queryClient as any)._id ?? "(no id)"} ` +
    `pathname=${location.pathname}`
  );
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    handlersEffectRunRef.current += 1;
    console.log(
      `[${PAGE_NAME}] useEffect "registerHandlers" run #${handlersEffectRunRef.current}`
    );

    const unsubscribeReceive = notificationSignalR.onReceiveNotification(
      (notification) => {
        applyRealtimeNotification(queryClient, notification);
      }
    );

    const unsubscribeReconnected = notificationSignalR.onReconnected(() => {
      reconnectInvalidationCount += 1;
      console.warn(
        `[${PAGE_NAME}] SignalR onReconnected FIRED — invalidation #${reconnectInvalidationCount} ` +
        `(if this fires often, the hub is repeatedly disconnecting/reconnecting)`
      );
      console.trace(`[${PAGE_NAME}] onReconnected stack trace`);
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
    connectEffectRunRef.current += 1;
    connectEffectFireCount += 1;
    console.log(
      `[${PAGE_NAME}] useEffect "connectOnRoute" run #${connectEffectRunRef.current} ` +
      `(global fires: ${connectEffectFireCount}) ` +
      `pathname=${location.pathname} ` +
      `authenticated=${authAPI.isAuthenticated()}`
    );
    // DIAGNOSTIC: if connectEffectFireCount keeps growing during idle,
    // location.pathname is changing while user is not navigating.
    if (connectEffectFireCount > 2) {
      console.warn(
        `[${PAGE_NAME}] connectOnRoute has fired ${connectEffectFireCount} times — ` +
        `pathname is changing unexpectedly. Last pathname=${location.pathname}`
      );
      console.trace(`[${PAGE_NAME}] connectOnRoute extra fire stack`);
    }

    if (!authAPI.isAuthenticated()) {
      console.log(`[${PAGE_NAME}] Not authenticated — disconnecting notifications hub`);
      void notificationSignalR.disconnect();
      return;
    }

    console.log(`[${PAGE_NAME}] Triggering notificationSignalR.connect()`);
    void notificationSignalR.connect().catch((error) => {
      console.error("[NotificationHub] connect failed", error);
    });
  }, [location.pathname]);

  useEffect(() => {
    unmountEffectRunRef.current += 1;
    console.log(
      `[${PAGE_NAME}] useEffect "cleanupOnUnmount" run #${unmountEffectRunRef.current}`
    );

    return () => {
      console.log(`[${PAGE_NAME}] Unmount cleanup — disconnecting notifications hub`);
      void notificationSignalR.disconnect();
    };
  }, []);
}
