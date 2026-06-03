import apiClient from './api';
import type { ExploreSearchParams, PagedResult } from '../types/api';
import { toExploreQueryParams, unwrapPagedExplore } from './exploreApiUtils';

export interface RoadmapExploreDto {
  roadmapId: number;
  title: string;
  description: string;
  skillDomainId: number;
  subDomainId: number;
  duration?: number;
  phasesCount: number;
}

export const exploreRoadmaps = async (
  params: ExploreSearchParams = {}
): Promise<PagedResult<RoadmapExploreDto>> => {
  const response = await apiClient.get('/Explore/roadmaps', {
    params: toExploreQueryParams(params),
  });
  return unwrapPagedExplore(response, 'Failed to fetch roadmaps');
};

export default { exploreRoadmaps };
