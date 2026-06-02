import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";
import {
  NOTIFICATION_DEFAULT_PAGE,
  NOTIFICATION_DEFAULT_PAGE_SIZE,
} from "../constants";
import { notificationKeys } from "../constants/notificationQueryKeys";
import { clampNotificationPageSize } from "./notificationCache";

export type UseNotificationsOptions = {
  enabled?: boolean;
};

export function useNotifications(
  page: number = NOTIFICATION_DEFAULT_PAGE,
  pageSize: number = NOTIFICATION_DEFAULT_PAGE_SIZE,
  options?: UseNotificationsOptions
) {
  const resolvedPageSize = clampNotificationPageSize(pageSize);

  return useQuery({
    queryKey: notificationKeys.list(page, resolvedPageSize),
    queryFn: () =>
      notificationService.getNotifications({
        page,
        pageSize: resolvedPageSize,
      }),
    enabled: options?.enabled ?? true,
  });
}
