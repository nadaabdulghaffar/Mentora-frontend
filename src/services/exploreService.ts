import apiClient from './api';
import type { ExploreSearchParams, PagedResult } from '../types/api';
import type { CommunityResponse } from './communityService';
import type { RoadmapExploreDto } from './exploreRoadmapService';
import { toExploreQueryParams, unwrapPagedExplore } from './exploreApiUtils';

const EXPLORE_MENTORS_ENDPOINT =
  import.meta.env.VITE_EXPLORE_MENTORS_ENDPOINT || '/Explore/mentors';

const EXPLORE_PROGRAMS_ENDPOINT =
  import.meta.env.VITE_EXPLORE_PROGRAMS_ENDPOINT || '/Explore/programs';

const EXPLORE_PREVIEW_ENDPOINT =
  import.meta.env.VITE_EXPLORE_PREVIEW_ENDPOINT || '/Explore/preview';

export interface MentorExploreDto {
  mentorId: string;
  fullName: string;
  domainName?: string;
  profileImageUrl?: string;
  bio?: string;
  rating?: number | null;
}

export interface ProgramExploreDto {
  id: number;
  title: string;
  mentorName: string;
  domainName: string;
  subDomainName: string;
  description: string;
  mentorProfileImageUrl?: string;
}

export interface ExplorePreviewSection<T> {
  items: T[];
  totalCount: number;
}

export interface ExploreAllPreviewDto {
  programs: ExplorePreviewSection<ProgramExploreDto>;
  mentors: ExplorePreviewSection<MentorExploreDto>;
  roadmaps: ExplorePreviewSection<RoadmapExploreDto>;
  communities: ExplorePreviewSection<CommunityResponse>;
}

export const exploreMentors = async (
  params: ExploreSearchParams = {}
): Promise<PagedResult<MentorExploreDto>> => {
  const response = await apiClient.get(EXPLORE_MENTORS_ENDPOINT, {
    params: toExploreQueryParams(params),
  });
  return unwrapPagedExplore(response, 'Failed to fetch mentors');
};

export const explorePrograms = async (
  params: ExploreSearchParams = {}
): Promise<PagedResult<ProgramExploreDto>> => {
  const response = await apiClient.get(EXPLORE_PROGRAMS_ENDPOINT, {
    params: toExploreQueryParams(params),
  });
  return unwrapPagedExplore(response, 'Failed to fetch programs');
};

export const explorePreview = async (
  params: Omit<ExploreSearchParams, 'pageNumber' | 'pageSize'> = {}
): Promise<ExploreAllPreviewDto> => {
  const response = await apiClient.get(EXPLORE_PREVIEW_ENDPOINT, {
    params: toExploreQueryParams(params),
  });

  if (!response.data?.success || !response.data?.data) {
    throw new Error(response.data?.message || 'Failed to fetch explore preview');
  }

  return response.data.data as ExploreAllPreviewDto;
};

export default { exploreMentors, explorePrograms, explorePreview };
