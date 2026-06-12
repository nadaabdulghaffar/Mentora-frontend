import apiClient from "../../config/api";
import type { ApiResponse, PagedResult } from "../../types/api";
import type { AdminEntityListItemDto, AdminEntityFilterParams } from "../types/admin.types";

export const entityService = {
  getPrograms: async (params: AdminEntityFilterParams): Promise<ApiResponse<PagedResult<AdminEntityListItemDto>>> => {
    const response = await apiClient.get("/admin/programs", { params });
    return response.data;
  },

  getCommunities: async (params: AdminEntityFilterParams): Promise<ApiResponse<PagedResult<AdminEntityListItemDto>>> => {
    const response = await apiClient.get("/admin/communities", { params });
    return response.data;
  },

  getRoadmaps: async (params: AdminEntityFilterParams): Promise<ApiResponse<PagedResult<AdminEntityListItemDto>>> => {
    const response = await apiClient.get("/admin/roadmaps", { params });
    return response.data;
  },
};
