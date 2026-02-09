import apiClient from '../config/api';
import type {
  ApiResponse,
  Country,
  Domain,
  SubDomain,
  CareerGoal,
  LearningStyle,
  Technology,
  EducationStatus,
  ExperienceLevel,
} from '../types/api';

// خدمات الـ Lookups
export const lookupAPI = {
  // الحصول على قائمة الدول
  getCountries: async (): Promise<ApiResponse<Country[]>> => {
    const response = await apiClient.get('/lookup/countries');
    if (Array.isArray(response.data)) {
      const normalized = response.data.map((country: any) => ({
        id: String(country.id ?? country.countryCode),
        code: String(country.code ?? country.countryCode),
        name: country.name ?? country.countryName,
      }));
      return { success: true, data: normalized };
    }
    return response.data;
  },

  // الحصول على قائمة المجالات
  getDomains: async (): Promise<ApiResponse<Domain[]>> => {
    const response = await apiClient.get('/lookup/domains');
    if (Array.isArray(response.data)) {
      const normalized = response.data.map((domain: any) => ({
        id: String(domain.id ?? domain.domainId),
        name: domain.name,
      }));
      return { success: true, data: normalized };
    }
    return response.data;
  },

  // الحصول على قائمة المجالات الفرعية
  getSubDomains: async (domainId: string): Promise<ApiResponse<SubDomain[]>> => {
    const response = await apiClient.get(`/lookup/domains/${domainId}/subdomains`);
    if (Array.isArray(response.data)) {
      const normalized = response.data.map((subDomain: any) => ({
        id: String(subDomain.id ?? subDomain.subDomainId),
        domainId: String(subDomain.domainId),
        name: subDomain.name,
      }));
      return { success: true, data: normalized };
    }
    return response.data;
  },

  // الحصول على قائمة التقنيات
  getTechnologies: async (subDomainId: string): Promise<ApiResponse<Technology[]>> => {
    const response = await apiClient.get(`/lookup/subdomains/${subDomainId}/technologies`);
    if (Array.isArray(response.data)) {
      const normalized = response.data.map((tech: any) => ({
        id: String(tech.id ?? tech.technologyId),
        name: tech.name,
      }));
      return { success: true, data: normalized };
    }
    return response.data;
  },

  // الحصول على قائمة الأهداف المهنية
  getCareerGoals: async (): Promise<ApiResponse<CareerGoal[]>> => {
    const response = await apiClient.get('/lookup/career-goals');
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    return response.data;
  },

  // الحصول على قائمة أساليب التعلم
  getLearningStyles: async (): Promise<ApiResponse<LearningStyle[]>> => {
    const response = await apiClient.get('/lookup/learning-styles');
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    return response.data;
  },

  // الحصول على حالات التعليم
  getEducationStatuses: async (): Promise<ApiResponse<EducationStatus[]>> => {
    const response = await apiClient.get('/lookup/education-statuses');
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    return response.data;
  },

  // الحصول على مستويات الخبرة
  getExperienceLevels: async (): Promise<ApiResponse<ExperienceLevel[]>> => {
    const response = await apiClient.get('/lookup/experience-levels');
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    return response.data;
  },
};

export default lookupAPI;
