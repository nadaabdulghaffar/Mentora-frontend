import apiClient from "../../config/api";
import type { ApiResponse, PagedResult } from "../../types/api";
import type { AdminRoadmapListItemDto } from "../types/admin.types";

export interface RoadmapFilterParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  domainId?: number;
  sortBy?: string;
}

export const roadmapsService = {
  getRoadmaps: async (params: RoadmapFilterParams): Promise<ApiResponse<PagedResult<AdminRoadmapListItemDto>>> => {
    const response = await apiClient.get("/admin/roadmaps", { params });
    return response.data;
  },
};
