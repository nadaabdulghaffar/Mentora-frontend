import apiClient from './api';
import { RecommendationResponse, RecommendationItem } from '../types/recommendation';

export const recommendationService = {
  getMentorRecommendations: async (topK: number = 3): Promise<RecommendationItem[]> => {
    const { data } = await apiClient.get<RecommendationResponse>(`/Recommendation/mentors?topK=${topK}`);
    return data.data;
  },

  getProgramRecommendations: async (topK: number = 3): Promise<RecommendationItem[]> => {
    const { data } = await apiClient.get<RecommendationResponse>(`/Recommendation/programs?topK=${topK}`);
    return data.data;
  },

  getCommunityRecommendations: async (topK: number = 3): Promise<RecommendationItem[]> => {
    const { data } = await apiClient.get<RecommendationResponse>(`/Recommendation/communities?topK=${topK}`);
    return data.data;
  }
};
