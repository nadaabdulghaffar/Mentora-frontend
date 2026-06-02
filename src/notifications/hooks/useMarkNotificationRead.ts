import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";
import {
  adjustUnreadCount,
  cancelNotificationQueries,
  invalidateNotificationLists,
  invalidateNotificationUnreadCount,
  markNotificationReadInLists,
  restoreListQueries,
  restoreUnreadCount,
  snapshotListQueries,
  snapshotUnreadCount,
  type NotificationListQueriesSnapshot,
} from "./notificationCache";

export type MarkNotificationReadVariables = {
  notificationId: string;
};

type MarkNotificationReadContext = {
  previousUnreadCount: number | undefined;
  previousLists: NotificationListQueriesSnapshot;
};

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId }: MarkNotificationReadVariables) =>
      notificationService.markAsRead(notificationId),
    onMutate: async ({ notificationId }) => {
      await cancelNotificationQueries(queryClient);

      const previousUnreadCount = snapshotUnreadCount(queryClient);
      const previousLists = snapshotListQueries(queryClient);

      const wasUnread = markNotificationReadInLists(
        queryClient,
        notificationId
      );

      if (wasUnread) {
        adjustUnreadCount(queryClient, -1);
      }

      return {
        previousUnreadCount,
        previousLists,
      } satisfies MarkNotificationReadContext;
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
