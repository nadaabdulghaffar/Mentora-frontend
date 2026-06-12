import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moderationService } from "../services/moderationService";
import type { ModerationQueueFilterParams, AdminActionRequest } from "../types/admin.types";

export const moderationKeys = {
  all: ["admin", "moderation"] as const,
  queue: (params: ModerationQueueFilterParams) =>
    [...moderationKeys.all, "queue", params] as const,
  detail: (id: string) => [...moderationKeys.all, "detail", id] as const,
};

export const useModerationQueue = (params: ModerationQueueFilterParams) => {
  return useQuery({
    queryKey: moderationKeys.queue(params),
    queryFn: () => moderationService.getQueue(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useModerationDetail = (id?: string) => {
  return useQuery({
    queryKey: moderationKeys.detail(id!),
    queryFn: () => moderationService.getReportDetails(id!),
    enabled: !!id,
  });
};

export const useApplyModerationAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: AdminActionRequest }) =>
      moderationService.applyAction(id, request),
    onSuccess: (_, variables) => {
      // Invalidate the detail of the acted item
      queryClient.invalidateQueries({
        queryKey: moderationKeys.detail(variables.id),
      });
      // Invalidate the queue list so the updated status reflects
      queryClient.invalidateQueries({
        queryKey: [...moderationKeys.all, "queue"],
      });
    },
  });
};
