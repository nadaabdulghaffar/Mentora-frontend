import { useQuery } from "@tanstack/react-query";
import { communitiesService, type CommunityFilterParams } from "../services/communitiesService";

export const adminCommunityKeys = {
  all: ["adminCommunities"] as const,
  lists: () => [...adminCommunityKeys.all, "list"] as const,
  list: (params: CommunityFilterParams) => [...adminCommunityKeys.lists(), params] as const,
};

export const useAdminCommunities = (params: CommunityFilterParams) => {
  return useQuery({
    queryKey: adminCommunityKeys.list(params),
    queryFn: () => communitiesService.getCommunities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
