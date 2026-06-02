import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";
import {
  adjustUnreadCount,
  cancelNotificationQueries,
  invalidateNotificationLists,
  invalidateNotificationUnreadCount,
  removeNotificationFromLists,
  restoreListQueries,
  restoreUnreadCount,
  snapshotListQueries,
  snapshotUnreadCount,
  type NotificationListQueriesSnapshot,
} from "./notificationCache";

export type DeleteNotificationVariables = {
  notificationId: string;
};

type DeleteNotificationContext = {
  previousUnreadCount: number | undefined;
  previousLists: NotificationListQueriesSnapshot;
};

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId }: DeleteNotificationVariables) =>
      notificationService.deleteNotification(notificationId),
    onMutate: async ({ notificationId }) => {
      await cancelNotificationQueries(queryClient);

      const previousUnreadCount = snapshotUnreadCount(queryClient);
      const previousLists = snapshotListQueries(queryClient);

      const wasUnread = removeNotificationFromLists(
        queryClient,
        notificationId
      );

      if (wasUnread) {
        adjustUnreadCount(queryClient, -1);
      }

      return {
        previousUnreadCount,
        previousLists,
      } satisfies DeleteNotificationContext;
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
