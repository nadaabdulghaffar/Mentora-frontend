import apiClient from './api';

export interface RoadmapExploreDto {
  roadmapId: number;
  title: string;
  description: string;
  skillDomainId: number;
  subDomainId: number;
  duration?: number;
  phasesCount: number;
}

export const exploreRoadmaps = async (searchQuery = ''): Promise<RoadmapExploreDto[]> => {
  const resp = await apiClient.get('/Explore/roadmaps', { params: { SearchQuery: searchQuery } });

  if (!resp.data?.success || !resp.data?.data) {
    throw new Error(resp.data?.message || 'Failed to fetch roadmaps');
  }

  return resp.data.data as RoadmapExploreDto[];
};

export default { exploreRoadmaps };
