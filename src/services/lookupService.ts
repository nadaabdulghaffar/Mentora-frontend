import apiClient from '../config/api';
import type {
  ApiResponse,
  Country,
  Domain,
  SubDomain,
  CareerGoal,
  LearningStyle,
} from '../types/api';

// خدمات الـ Lookups
export const lookupAPI = {
  // الحصول على قائمة الدول
  getCountries: async (): Promise<ApiResponse<Country[]>> => {
    const response = await apiClient.get('/lookup/countries');
    return response.data;
  },

  // الحصول على قائمة المجالات
  getDomains: async (): Promise<ApiResponse<Domain[]>> => {
    const response = await apiClient.get('/lookup/domains');
    return response.data;
  },

  // الحصول على قائمة المجالات الفرعية
  getSubDomains: async (domainId?: string): Promise<ApiResponse<SubDomain[]>> => {
    const url = domainId 
      ? `/lookup/subdomains?domainId=${domainId}` 
      : '/lookup/subdomains';
    const response = await apiClient.get(url);
    return response.data;
  },

  // الحصول على قائمة الأهداف المهنية
  getCareerGoals: async (): Promise<ApiResponse<CareerGoal[]>> => {
    const response = await apiClient.get('/lookup/career-goals');
    return response.data;
  },

  // الحصول على قائمة أساليب التعلم
  getLearningStyles: async (): Promise<ApiResponse<LearningStyle[]>> => {
    const response = await apiClient.get('/lookup/learning-styles');
    return response.data;
  },
};

export default lookupAPI;
