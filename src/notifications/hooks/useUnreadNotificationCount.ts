import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";
import { notificationKeys } from "../constants/notificationQueryKeys";

// ── Diagnostics ──────────────────────────────────────────────
let unreadCountFetchSeq = 0;
// ─────────────────────────────────────────────────────────────────

export type UseUnreadNotificationCountOptions = {
  enabled?: boolean;
};

export function useUnreadNotificationCount(
  options?: UseUnreadNotificationCountOptions
) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      unreadCountFetchSeq += 1;
      const seq = unreadCountFetchSeq;
      const t0 = performance.now();
      console.log(
        `[UnreadCount] queryFn EXECUTING fetch #${seq} — this is a real network call`
      );
      // Stack trace: shows what invalidation or window-focus event triggered this
      console.trace(`[UnreadCount] fetch #${seq} triggered by`);
      try {
        const result = await notificationService.getUnreadCount();
        console.log(
          `[UnreadCount] fetch #${seq} DONE in ${Math.round(performance.now() - t0)}ms — count=${result}`
        );
        return result;
      } catch (err) {
        console.error(
          `[UnreadCount] fetch #${seq} FAILED in ${Math.round(performance.now() - t0)}ms`,
          err
        );
        throw err;
      }
    },
    enabled: options?.enabled ?? true,
    // NOTE: staleTime is NOT set here — React Query default is 0ms,
    // meaning every window-focus or query invalidation will refetch immediately.
    // See queryClient.ts — staleTime is also not set globally.
  });
}
