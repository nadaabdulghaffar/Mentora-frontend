import { useQuery } from "@tanstack/react-query";
import { entityService } from "../services/entityService";
import type { AdminEntityFilterParams } from "../types/admin.types";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const adminEntityKeys = {
  all: ["admin", "entities"] as const,
  programs: (params: AdminEntityFilterParams) => [...adminEntityKeys.all, "programs", params] as const,
  communities: (params: AdminEntityFilterParams) => [...adminEntityKeys.all, "communities", params] as const,
  roadmaps: (params: AdminEntityFilterParams) => [...adminEntityKeys.all, "roadmaps", params] as const,
};

export const useAdminPrograms = (params: AdminEntityFilterParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: adminEntityKeys.programs(params),
    queryFn: () => entityService.getPrograms(params),
    staleTime: STALE_TIME,
    enabled,
  });
};

export const useAdminCommunities = (params: AdminEntityFilterParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: adminEntityKeys.communities(params),
    queryFn: () => entityService.getCommunities(params),
    staleTime: STALE_TIME,
    enabled,
  });
};

export const useAdminRoadmaps = (params: AdminEntityFilterParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: adminEntityKeys.roadmaps(params),
    queryFn: () => entityService.getRoadmaps(params),
    staleTime: STALE_TIME,
    enabled,
  });
};
