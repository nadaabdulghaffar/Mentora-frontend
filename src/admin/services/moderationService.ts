import apiClient from "../../config/api";
import type { ApiResponse, PagedResult } from "../../types/api";
import type { 
  ReportedItemSummaryDto, 
  ReportedItemDetailDto, 
  ModerationQueueFilterParams,
  AdminActionRequest
} from "../types/admin.types";

export const moderationService = {
  getQueue: async (params: ModerationQueueFilterParams): Promise<ApiResponse<PagedResult<ReportedItemSummaryDto>>> => {
    // Ensure we send 'page' and 'pageSize' as the API expects
    const queryParams = {
      page: params.pageNumber || 1,
      pageSize: params.pageSize || 20,
      status: params.status,
      targetType: params.targetType,
    };
    const response = await apiClient.get("/report/admin/queue", { params: queryParams });
    return response.data;
  },

  getReportDetails: async (reportId: string): Promise<ApiResponse<ReportedItemDetailDto>> => {
    const response = await apiClient.get(`/report/admin/${reportId}`);
    return response.data;
  },

  applyAction: async (reportId: string, actionData: AdminActionRequest): Promise<ApiResponse<boolean>> => {
    const ContentActionMap: Record<string, number> = {
      None: 0,
      Approved: 1,
      ContentDeleted: 2,
    };
    
    const UserActionMap: Record<string, number> = {
      None: 0,
      Warning: 1,
      TemporaryBan: 2,
      PermanentBan: 3,
    };

    const payload = {
      ...actionData,
      contentAction: ContentActionMap[actionData.contentAction] ?? 0,
      userAction: UserActionMap[actionData.userAction] ?? 0,
    };

    const response = await apiClient.post(`/report/admin/${reportId}/action`, payload);
    return response.data;
  },
};
