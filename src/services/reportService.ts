import api from './api';
import type { ApiResponse } from '../types/api';
import type { SubmitReportPayload } from '../types/report.types';

export const reportService = {
  submitReport: async (payload: SubmitReportPayload): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/report', payload);
    return response.data;
  },
};
