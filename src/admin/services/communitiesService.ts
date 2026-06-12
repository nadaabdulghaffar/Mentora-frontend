import apiClient from "../../config/api";
import type { ApiResponse, PagedResult } from "../../types/api";
import type { AdminCommunityListItemDto } from "../types/admin.types";

export interface CommunityFilterParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  domainId?: number;
  sortBy?: string;
}

export const communitiesService = {
  getCommunities: async (params: CommunityFilterParams): Promise<ApiResponse<PagedResult<AdminCommunityListItemDto>>> => {
    const response = await apiClient.get("/admin/communities", { params });
    return response.data;
  },
};
