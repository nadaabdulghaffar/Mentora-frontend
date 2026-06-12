import type { ApiResponse } from "../../types/api";
import type {
  NotificationTypeValue,
  ReferenceTypeValue,
} from "./notification.enums";

/** Matches backend `Mentora.Application.DTOs.Notifications.NotificationDto`. */
export interface NotificationDto {
  notificationId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  referenceType?: ReferenceTypeValue;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

/** Matches backend `Mentora.Application.DTOs.Common.PagedResult<T>` for notifications. */
export interface NotificationPagedResult {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Alias matching the integration doc name for the paged list payload. */
export type NotificationListResponse = NotificationPagedResult;

export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
}

export type NotificationsListResponse = ApiResponse<NotificationPagedResult>;
export type NotificationUnreadCountResponse = ApiResponse<number>;
export type NotificationMutationResponse = ApiResponse<boolean>;
