import apiClient from "../../config/api";
import type { ApiResponse } from "../../types/api";
import type { 
  AdminDashboardStatsDto, 
  AdminProgramsDashboardStatsDto, 
  AdminCommunityDashboardStatsDto, 
  AdminRoadmapDashboardStatsDto 
} from "../types/admin.types";

export const dashboardService = {
  getDashboardStats: async (): Promise<ApiResponse<AdminDashboardStatsDto>> => {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  },

  getProgramsStats: async (): Promise<ApiResponse<AdminProgramsDashboardStatsDto>> => {
    const response = await apiClient.get("/admin/programs/stats");
    return response.data;
  },

  getCommunitiesStats: async (): Promise<ApiResponse<AdminCommunityDashboardStatsDto>> => {
    const response = await apiClient.get("/admin/communities/stats");
    return response.data;
  },

  getRoadmapsStats: async (): Promise<ApiResponse<AdminRoadmapDashboardStatsDto>> => {
    const response = await apiClient.get("/admin/roadmaps/stats");
    return response.data;
  },
};
