import apiClient from "../../config/api";
import type { ApiResponse, PagedResult } from "../../types/api";
import type { AdminUserListItemDto, AdminUsersFilterParams } from "../types/admin.types";

export const userService = {
  getMentors: async (params: AdminUsersFilterParams): Promise<ApiResponse<PagedResult<AdminUserListItemDto>>> => {
    const response = await apiClient.get("/admin/users/mentors", { params });
    return response.data;
  },

  getMentees: async (params: AdminUsersFilterParams): Promise<ApiResponse<PagedResult<AdminUserListItemDto>>> => {
    const response = await apiClient.get("/admin/users/mentees", { params });
    return response.data;
  },

  banUser: async (userId: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.put(`/admin/users/${userId}/ban`);
    return response.data;
  },

  reactivateUser: async (userId: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.put(`/admin/users/${userId}/reactivate`);
    return response.data;
  },

  notifyUser: async (userId: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.post(`/admin/users/${userId}/notify`);
    return response.data;
  },
};
