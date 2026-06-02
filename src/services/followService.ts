import apiClient from './api';
import type { ApiResponse } from '../types/api';

export type FollowingMentorDto = {
  mentorId: string;
  fullName: string;
  profilePictureUrl?: string | null;
  domainName: string;
  averageRating?: number | null;
  followerCount?: number | null;
  followedAt: string;
};

function unwrap<T>(body: ApiResponse<T> | undefined): T {
  if (!body || body.success !== true || body.data === undefined || body.data === null) {
    throw new Error(body?.message || 'Follow request failed');
  }
  return body.data;
}

function normalizeFollowingMentor(raw: Record<string, unknown>): FollowingMentorDto {
  return {
    mentorId: String(raw.mentorId ?? raw.MentorId ?? ''),
    fullName: String(raw.fullName ?? raw.FullName ?? ''),
    profilePictureUrl: (raw.profilePictureUrl ?? raw.ProfilePictureUrl) as string | null | undefined,
    domainName: String(raw.domainName ?? raw.DomainName ?? ''),
    averageRating: (raw.averageRating ?? raw.AverageRating) as number | null | undefined,
    followerCount: Number(raw.followerCount ?? raw.FollowerCount ?? 0) || 0,
    followedAt: String(raw.followedAt ?? raw.FollowedAt ?? ''),
  };
}

export const followService = {
  async followMentor(mentorId: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<boolean>>(`/Follow/${mentorId}`);
    unwrap(response.data);
  },

  async unfollowMentor(mentorId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/Follow/${mentorId}`);
    unwrap(response.data);
  },

  async getMyFollowing(): Promise<FollowingMentorDto[]> {
    const response = await apiClient.get<ApiResponse<unknown[]>>('/Follow/me');
    const data = unwrap(response.data);
    return (data as Record<string, unknown>[]).map(normalizeFollowingMentor);
  },

  async getFollowerCount(mentorId: string): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(`/Follow/${mentorId}/count`);
    return unwrap(response.data);
  },

  async isFollowingMentor(mentorId: string): Promise<boolean> {
    const following = await this.getMyFollowing();
    return following.some(
      (mentor) => mentor.mentorId.toLowerCase() === mentorId.toLowerCase()
    );
  },
};
