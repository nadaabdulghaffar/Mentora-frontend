import { useQuery } from '@tanstack/react-query';
import { recommendationService } from '../services/recommendationService';

export const useRecommendations = (type: 'mentors' | 'programs' | 'communities', topK: number = 3) => {
  return useQuery({
    queryKey: ['recommendations', type, topK],
    queryFn: async () => {
      switch (type) {
        case 'mentors':
          return await recommendationService.getMentorRecommendations(topK);
        case 'programs':
          return await recommendationService.getProgramRecommendations(topK);
        case 'communities':
          return await recommendationService.getCommunityRecommendations(topK);
        default:
          throw new Error('Invalid recommendation type');
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000,    // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
