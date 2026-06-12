import apiClient from "../../config/api";
import type { ApiResponse, PagedResult } from "../../types/api";
import type { AdminProgramListItemDto, AdminProgramDetailDto } from "../types/admin.types";

export interface ProgramFilterParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  domainId?: number;
  sortBy?: string;
}

export const programsService = {
  getPrograms: async (params: ProgramFilterParams): Promise<ApiResponse<PagedResult<AdminProgramListItemDto>>> => {
    const response = await apiClient.get("/admin/programs", { params });
    return response.data;
  },

  getProgramById: async (programId: number): Promise<ApiResponse<AdminProgramDetailDto>> => {
    const response = await apiClient.get(`/admin/programs/${programId}`);
    return response.data;
  },
};
