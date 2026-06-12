import { useQueries, useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const adminDashboardKeys = {
  all: ["admin", "dashboard"] as const,
  stats: () => [...adminDashboardKeys.all, "stats"] as const,
  programs: () => [...adminDashboardKeys.all, "programs"] as const,
  communities: () => [...adminDashboardKeys.all, "communities"] as const,
  roadmaps: () => [...adminDashboardKeys.all, "roadmaps"] as const,
};

// Optional: A hook if someone wants all stats at once
export const useAdminDashboardQueries = () => {
  return useQueries({
    queries: [
      {
        queryKey: adminDashboardKeys.stats(),
        queryFn: dashboardService.getDashboardStats,
        staleTime: STALE_TIME,
      },
      {
        queryKey: adminDashboardKeys.programs(),
        queryFn: dashboardService.getProgramsStats,
        staleTime: STALE_TIME,
      },
      {
        queryKey: adminDashboardKeys.communities(),
        queryFn: dashboardService.getCommunitiesStats,
        staleTime: STALE_TIME,
      },
      {
        queryKey: adminDashboardKeys.roadmaps(),
        queryFn: dashboardService.getRoadmapsStats,
        staleTime: STALE_TIME,
      },
    ],
  });
};

// Independent hooks for independent cards
export const useAdminStats = () => {
  return useQuery({
    queryKey: adminDashboardKeys.stats(),
    queryFn: dashboardService.getDashboardStats,
    staleTime: STALE_TIME,
    retry: 1,
  });
};

export const useAdminProgramsStats = () => {
  return useQuery({
    queryKey: adminDashboardKeys.programs(),
    queryFn: dashboardService.getProgramsStats,
    staleTime: STALE_TIME,
    retry: 1,
  });
};

export const useAdminCommunitiesStats = () => {
  return useQuery({
    queryKey: adminDashboardKeys.communities(),
    queryFn: dashboardService.getCommunitiesStats,
    staleTime: STALE_TIME,
    retry: 1,
  });
};

export const useAdminRoadmapsStats = () => {
  return useQuery({
    queryKey: adminDashboardKeys.roadmaps(),
    queryFn: dashboardService.getRoadmapsStats,
    staleTime: STALE_TIME,
    retry: 1,
  });
};
