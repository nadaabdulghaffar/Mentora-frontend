import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";
import { notificationKeys } from "../constants/notificationQueryKeys";

export type UseUnreadNotificationCountOptions = {
  enabled?: boolean;
};

export function useUnreadNotificationCount(
  options?: UseUnreadNotificationCountOptions
) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    enabled: options?.enabled ?? true,
  });
}
