import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moderationService } from "../services/moderationService";
import type { ModerationQueueFilterParams } from "../types/admin.types";

const STALE_TIME = 1 * 60 * 1000; // 1 minute for moderation queue to stay fresh

export const moderationKeys = {
  all: ["admin", "moderation"] as const,
  queue: (params: ModerationQueueFilterParams) => [...moderationKeys.all, "queue", params] as const,
  detail: (id: number | null) => [...moderationKeys.all, "detail", id] as const,
};

export const useModerationQueue = (params: ModerationQueueFilterParams) => {
  return useQuery({
    queryKey: moderationKeys.queue(params),
    queryFn: () => moderationService.getQueue(params),
    staleTime: STALE_TIME,
  });
};

export const useReportDetails = (reportId: number | null) => {
  return useQuery({
    queryKey: moderationKeys.detail(reportId),
    queryFn: () => moderationService.getReportDetails(reportId!),
    staleTime: STALE_TIME,
    enabled: !!reportId, // LAZY LOADING: only fetch if a report is selected
  });
};

export const useApplyModerationAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, actionData }: { reportId: number; actionData: { action: string; note?: string } }) => 
      moderationService.applyAction(reportId, actionData),
    onSuccess: (_, variables) => {
      // Invalidate the queue list to trigger silent refetch
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
      // Invalidate specific detail to ensure fresh state if opened again
      queryClient.invalidateQueries({ queryKey: moderationKeys.detail(variables.reportId) });
    },
  });
};
