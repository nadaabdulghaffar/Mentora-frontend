import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import type { AdminUsersFilterParams } from "../types/admin.types";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  mentors: (params: AdminUsersFilterParams) => [...adminUserKeys.all, "mentors", params] as const,
  mentees: (params: AdminUsersFilterParams) => [...adminUserKeys.all, "mentees", params] as const,
};

export const useAdminMentors = (params: AdminUsersFilterParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: adminUserKeys.mentors(params),
    queryFn: () => userService.getMentors(params),
    staleTime: STALE_TIME,
    enabled,
  });
};

export const useAdminMentees = (params: AdminUsersFilterParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: adminUserKeys.mentees(params),
    queryFn: () => userService.getMentees(params),
    staleTime: STALE_TIME,
    enabled,
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.banUser(userId),
    onSuccess: () => {
      // Invalidate all users queries so lists refresh silently
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.reactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};

export const useNotifyUser = () => {
  return useMutation({
    mutationFn: (userId: string) => userService.notifyUser(userId),
  });
};
