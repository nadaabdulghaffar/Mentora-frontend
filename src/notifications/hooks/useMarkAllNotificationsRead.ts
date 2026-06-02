import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";
import { notificationKeys } from "../constants/notificationQueryKeys";
import {
  cancelNotificationQueries,
  invalidateNotificationLists,
  invalidateNotificationUnreadCount,
  markAllNotificationsReadInLists,
  restoreListQueries,
  restoreUnreadCount,
  snapshotListQueries,
  snapshotUnreadCount,
  type NotificationListQueriesSnapshot,
} from "./notificationCache";

type MarkAllNotificationsReadContext = {
  previousUnreadCount: number | undefined;
  previousLists: NotificationListQueriesSnapshot;
};

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await cancelNotificationQueries(queryClient);

      const previousUnreadCount = snapshotUnreadCount(queryClient);
      const previousLists = snapshotListQueries(queryClient);

      markAllNotificationsReadInLists(queryClient);
      queryClient.setQueryData<number>(notificationKeys.unreadCount(), 0);

      return {
        previousUnreadCount,
        previousLists,
      } satisfies MarkAllNotificationsReadContext;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      restoreUnreadCount(queryClient, context.previousUnreadCount);
      restoreListQueries(queryClient, context.previousLists);
    },
    onSuccess: async () => {
      await Promise.all([
        invalidateNotificationUnreadCount(queryClient),
        invalidateNotificationLists(queryClient),
      ]);
    },
  });
}
