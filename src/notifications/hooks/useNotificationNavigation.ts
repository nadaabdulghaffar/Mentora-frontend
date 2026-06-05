import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { NotificationDto } from "../types";
import {
  resolveNotificationRoute,
  type NotificationNavigationResolution,
} from "../utils/resolveNotificationRoute";
import { useMarkNotificationRead } from "./useMarkNotificationRead";

type NavigateResult =
  | { navigated: true; resolution: Extract<NotificationNavigationResolution, { status: "resolved" }> }
  | { navigated: false; resolution: Exclude<NotificationNavigationResolution, { status: "resolved" }> };

type Options = {
  onNavigate?: () => void;
  onSettled?: () => void;
};

export function useNotificationNavigation(options?: Options) {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();

  const navigateToNotification = useCallback(
    (notification: NotificationDto): NavigateResult => {
      const resolution = resolveNotificationRoute(notification);

      if (resolution.status !== "resolved") {
        return { navigated: false, resolution };
      }

      const goToTarget = () => {
        const { target } = resolution;
        navigate(
          {
            pathname: target.pathname,
            search: target.search,
          },
          { state: target.state }
        );
        options?.onNavigate?.();
      };

      if (!notification.isRead) {
        markRead.mutate(
          { notificationId: notification.notificationId },
          {
            onSettled: () => {
              goToTarget();
              options?.onSettled?.();
            },
          }
        );
      } else {
        goToTarget();
        options?.onSettled?.();
      }

      return { navigated: true, resolution };
    },
    [markRead, navigate, options]
  );

  return {
    navigateToNotification,
    isNavigating: markRead.isPending,
  };
}
