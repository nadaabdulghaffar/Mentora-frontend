import { useQuery } from "@tanstack/react-query";
import { roadmapsService, type RoadmapFilterParams } from "../services/roadmapsService";

export const adminRoadmapKeys = {
  all: ["adminRoadmaps"] as const,
  lists: () => [...adminRoadmapKeys.all, "list"] as const,
  list: (params: RoadmapFilterParams) => [...adminRoadmapKeys.lists(), params] as const,
};

export const useAdminRoadmaps = (params: RoadmapFilterParams) => {
  return useQuery({
    queryKey: adminRoadmapKeys.list(params),
    queryFn: () => roadmapsService.getRoadmaps(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
