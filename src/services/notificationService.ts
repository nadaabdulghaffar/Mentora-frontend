import apiClient from "./api";
import type { ApiResponse } from "../types/api";
import {
  NOTIFICATION_API_PATHS,
  NOTIFICATION_DEFAULT_PAGE,
  NOTIFICATION_DEFAULT_PAGE_SIZE,
  NOTIFICATION_MAX_PAGE_SIZE,
  NOTIFICATION_MIN_PAGE_SIZE,
} from "../notifications/constants";
import type {
  GetNotificationsParams,
  NotificationPagedResult,
} from "../notifications/types";

function unwrap<T>(body: ApiResponse<T> | undefined): T {
  if (
    !body ||
    body.success !== true ||
    body.data === undefined ||
    body.data === null
  ) {
    const err = new Error(
      body?.message || "Notification request failed"
    ) as Error & { response?: { data: unknown } };
    err.response = { data: body };
    throw err;
  }

  return body.data;
}

function clampPageSize(pageSize: number): number {
  return Math.min(
    Math.max(pageSize, NOTIFICATION_MIN_PAGE_SIZE),
    NOTIFICATION_MAX_PAGE_SIZE
  );
}

export const notificationService = {
  async getNotifications(
    params: GetNotificationsParams = {}
  ): Promise<NotificationPagedResult> {
    const page = params.page ?? NOTIFICATION_DEFAULT_PAGE;
    const pageSize = clampPageSize(
      params.pageSize ?? NOTIFICATION_DEFAULT_PAGE_SIZE
    );

    const response = await apiClient.get<
      ApiResponse<NotificationPagedResult>
    >(NOTIFICATION_API_PATHS.list, {
      params: { page, pageSize },
    });

    return unwrap(response.data);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(
      NOTIFICATION_API_PATHS.unreadCount
    );

    return unwrap(response.data);
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(
      NOTIFICATION_API_PATHS.markRead(notificationId)
    );

    return unwrap(response.data);
  },

  async markAllAsRead(): Promise<boolean> {
    const response = await apiClient.patch<ApiResponse<boolean>>(
      NOTIFICATION_API_PATHS.markAllRead
    );

    return unwrap(response.data);
  },

  async deleteNotification(notificationId: string): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      NOTIFICATION_API_PATHS.delete(notificationId)
    );

    return unwrap(response.data);
  },
};
