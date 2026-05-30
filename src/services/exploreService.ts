import apiClient from './api';

const EXPLORE_MENTORS_ENDPOINT =
  import.meta.env.VITE_EXPLORE_MENTORS_ENDPOINT || '/Explore/mentors';

const EXPLORE_PROGRAMS_ENDPOINT =
  import.meta.env.VITE_EXPLORE_PROGRAMS_ENDPOINT || '/Explore/programs';

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

export const exploreMentors = async (
  searchQuery = ''
): Promise<MentorExploreDto[]> => {
  const response = await apiClient.get(EXPLORE_MENTORS_ENDPOINT, {
    params: { SearchQuery: searchQuery },
  });

  if (!response.data?.success || !response.data?.data) {
    throw new Error(response.data?.message || 'Failed to fetch mentors');
  }

  return response.data.data as MentorExploreDto[];
};

export const explorePrograms = async (
  searchQuery = ''
): Promise<ProgramExploreDto[]> => {
  const response = await apiClient.get(EXPLORE_PROGRAMS_ENDPOINT, {
    params: { SearchQuery: searchQuery },
  });

  if (!response.data?.success || !response.data?.data) {
    throw new Error(response.data?.message || 'Failed to fetch programs');
  }

  return response.data.data as ProgramExploreDto[];
};

export default { exploreMentors, explorePrograms };
