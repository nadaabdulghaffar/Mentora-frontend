import apiClient from '../../services/api';
import type { ApiResponse, AuthUser } from '../../types/api';
import type { ProfileEntity } from './types';
import {
  DEMO_PUBLIC_MENTEE_ID,
  DEMO_PUBLIC_MENTOR_ID,
  MOCK_PROFILE_BY_ID,
  menteeTemplateForOwner,
  mentorTemplateForOwner,
} from './mockData';

type BackendEducationDto = {
  educationId: string;
  institution: string;
  faculty?: string | null;
  degree?: string | null;
  startYear?: number | null;
  graduationYear?: number | null;
  displayOrder: number;
};

type BackendLinkDto = {
  linkId: string;
  label: string;
  url: string;
  displayOrder: number;
};

type MenteeOwnProfileDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  domainName: string;
  currentLevel: string;
  educationStatus: string;
  education: BackendEducationDto[];
  links: BackendLinkDto[];
  createdAt: string;
};

type MentorOwnProfileDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  domainName: string;
  yearsOfExperience: number;
  linkedInUrl?: string | null;
  pastExperience?: string | null;
  education: BackendEducationDto[];
  links: BackendLinkDto[];
};

type PublicProfileDto = {
  userId: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
  role: string;
  domainName: string;
  countryName?: string | null;
  education: BackendEducationDto[];
  links: BackendLinkDto[];
  yearsOfExperience?: number | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  followerCount?: number | null;
  isVerified?: boolean | null;
};

export type OwnProfileUpdatePayload = {
  bio?: string;
  countryCode?: string;
  profilePictureUrl?: string;
  linkedInUrl?: string;
  pastExperience?: string;
};

export type EducationInput = {
  id: string;
  degree: string;
  faculty?: string;
  institution: string;
  startYear: string;
  endYear: string;
};

const DEMO_PROFILE_IDS = new Set([DEMO_PUBLIC_MENTOR_ID, DEMO_PUBLIC_MENTEE_ID]);

const PROFILE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isGuid(value: string | undefined): boolean {
  return !!value && PROFILE_ID_RE.test(value);
}

function unwrapProfileEnvelope<T>(body: ApiResponse<T> | undefined): T | null {
  if (!body || body.success !== true || body.data == null) {
    return null;
  }

  return body.data;
}

function normalizeBio(value?: string | null): string {
  return value?.trim() || '';
}

function normalizeName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function normalizeLocation(countryName?: string | null, countryCode?: string | null): string {
  return countryName?.trim() || countryCode?.trim() || '';
}

function normalizeSocialPlatform(label: string): ProfileEntity['socialLinks'][number]['platform'] {
  const lower = label.toLowerCase();
  if (lower.includes('linkedin')) return 'linkedin';
  if (lower.includes('behance')) return 'behance';
  if (lower.includes('portfolio')) return 'portfolio';
  return 'other';
}

function mapEducation(items: BackendEducationDto[]): ProfileEntity['education'] {
  return [...items]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((item) => ({
      id: item.educationId,
      degree: item.degree?.trim() || '',
      faculty: item.faculty?.trim() || undefined,
      institution: item.institution.trim(),
      startYear: item.startYear ? String(item.startYear) : '',
      endYear: item.graduationYear ? String(item.graduationYear) : '',
    }));
}

function mapLinks(links: BackendLinkDto[]): ProfileEntity['socialLinks'] {
  return [...links]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((item) => ({
      id: item.linkId,
      platform: normalizeSocialPlatform(item.label),
      label: item.label.trim(),
      url: item.url.trim(),
    }));
}

function mapOwnMenteeProfile(profile: MenteeOwnProfileDto): ProfileEntity {
  const displayName = normalizeName(profile.firstName, profile.lastName) || 'Mentee';

  return {
    userId: profile.userId,
    role: 'mentee',
    displayName,
    headline: profile.currentLevel?.trim() || profile.domainName?.trim() || 'Mentee',
    location: normalizeLocation(profile.countryName, profile.countryCode),
    countryCode: profile.countryCode?.trim() || undefined,
    email: profile.email,
    avatarUrl: profile.profilePictureUrl?.trim() || '',
    bio: normalizeBio(profile.bio),
    socialLinks: mapLinks(profile.links),
    education: mapEducation(profile.education),
    experience: [],
    domainId: undefined,
    yearsOfExperience: undefined,
    relevantExpertise: [],
    tools: [],
  };
}

function mapOwnMentorProfile(profile: MentorOwnProfileDto): ProfileEntity {
  const displayName = normalizeName(profile.firstName, profile.lastName) || 'Mentor';

  const socialLinks = mapLinks(profile.links);
  if (profile.linkedInUrl?.trim()) {
    socialLinks.unshift({
      id: `${profile.userId}-linkedin`,
      platform: 'linkedin',
      label: 'LinkedIn',
      url: profile.linkedInUrl.trim(),
    });
  }

  return {
    userId: profile.userId,
    role: 'mentor',
    displayName,
    headline: profile.domainName?.trim() || 'Mentor',
    location: normalizeLocation(profile.countryName, profile.countryCode),
    countryCode: profile.countryCode?.trim() || undefined,
    email: profile.email,
    avatarUrl: profile.profilePictureUrl?.trim() || '',
    bio: normalizeBio(profile.bio),
    socialLinks,
    education: mapEducation(profile.education),
    experience: [],
    domainId: undefined,
    yearsOfExperience: String(profile.yearsOfExperience ?? ''),
    relevantExpertise: [],
    tools: [],
  };
}

function mapPublicProfile(profile: PublicProfileDto): ProfileEntity {
  const role = profile.role?.toLowerCase() === 'mentor' ? 'mentor' : 'mentee';
  const displayName = normalizeName(profile.firstName, profile.lastName) || (role === 'mentor' ? 'Mentor' : 'Mentee');

  return {
    userId: profile.userId,
    role,
    displayName,
    headline: profile.domainName?.trim() || '',
    location: normalizeLocation(profile.countryName),
    email: '',
    avatarUrl: profile.profilePictureUrl?.trim() || '',
    bio: normalizeBio(profile.bio),
    socialLinks: mapLinks(profile.links),
    education: mapEducation(profile.education),
    experience: [],
    domainId: undefined,
    yearsOfExperience: profile.yearsOfExperience == null ? undefined : String(profile.yearsOfExperience),
    relevantExpertise: [],
    tools: [],
    reviewAverage: profile.averageRating ?? undefined,
    reviewTotal: profile.totalReviews ?? undefined,
  };
}

function toNullableTrimmed(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function refreshOwnProfile(): Promise<ProfileEntity | null> {
  const response = await apiClient.get<ApiResponse<MenteeOwnProfileDto | MentorOwnProfileDto>>('/profile/me');
  const payload = unwrapProfileEnvelope(response.data);

  if (!payload) {
    return null;
  }

  if ('yearsOfExperience' in payload) {
    return mapOwnMentorProfile(payload);
  }

  return mapOwnMenteeProfile(payload);
}

export async function updateOwnProfile(
  viewer: AuthUser,
  patch: OwnProfileUpdatePayload
): Promise<void> {
  const role = viewer.role?.toLowerCase() === 'mentor' ? 'mentor' : 'mentee';

  const payload = {
    bio: toNullableTrimmed(patch.bio),
    countryCode: toNullableTrimmed(patch.countryCode)?.toUpperCase(),
    profilePictureUrl: toNullableTrimmed(patch.profilePictureUrl),
    linkedInUrl: toNullableTrimmed(patch.linkedInUrl),
    pastExperience: toNullableTrimmed(patch.pastExperience),
  };

  const response =
    role === 'mentor'
      ? await apiClient.put<ApiResponse<boolean>>('/profile/me/mentor', payload)
      : await apiClient.put<ApiResponse<boolean>>('/profile/me/mentee', payload);

  if (response.data.success !== true) {
    throw new Error(response.data.message || 'Failed to update profile.');
  }
}

function isGuidString(value: string): boolean {
  return PROFILE_ID_RE.test(value);
}

export async function saveEducationEntries(entries: EducationInput[]): Promise<boolean> {
  const normalized = entries
    .map((entry, index) => ({
      ...entry,
      degree: entry.degree.trim(),
      faculty: toNullableTrimmed(entry.faculty),
      institution: entry.institution.trim(),
      displayOrder: index + 1,
      startYear: Number(entry.startYear),
      endYear: Number(entry.endYear),
    }))
    .filter((entry) => entry.degree || entry.institution);

  const existing = normalized.filter((entry) => isGuidString(entry.id));
  const incomingIds = new Set(existing.map((entry) => entry.id));

  const storedResponse = await apiClient.get<ApiResponse<MenteeOwnProfileDto | MentorOwnProfileDto>>('/profile/me');
  const storedProfile = unwrapProfileEnvelope(storedResponse.data);
  const currentEducation = storedProfile?.education ?? [];

  const operations: Promise<unknown>[] = [];

  for (const item of normalized) {
    const payload = {
      institution: item.institution,
      faculty: item.faculty,
      degree: item.degree,
      startYear: Number.isFinite(item.startYear) ? item.startYear : undefined,
      graduationYear: Number.isFinite(item.endYear) ? item.endYear : undefined,
      displayOrder: item.displayOrder,
    };

    if (isGuidString(item.id)) {
      operations.push(apiClient.put(`/profile/me/education/${item.id}`, payload));
    } else {
      operations.push(apiClient.post('/profile/me/education', payload));
    }
  }

  const removals = currentEducation.filter((entry) => !incomingIds.has(entry.educationId));
  for (const removed of removals) {
    operations.push(apiClient.delete(`/profile/me/education/${removed.educationId}`));
  }

  await Promise.all(operations);
  return true;
}

export function isPublicProfileView(
  viewer: AuthUser,
  routeUserId: string | undefined
): boolean {
  return !!routeUserId && routeUserId !== viewer.userId;
}

/**
 * Resolve which profile to render for this target id.
 * - Demo IDs: use local mock profiles for QA links.
 * - Public: read from the backend profile endpoint.
 * - Owner: read from the signed-in user's profile endpoint.
 */
export async function getProfileForRoute(
  viewer: AuthUser,
  routeUserId: string | undefined
): Promise<ProfileEntity | null> {
  const targetUserId = routeUserId ?? viewer.userId;
  const isPublic = !!(routeUserId && routeUserId !== viewer.userId);

  if (DEMO_PROFILE_IDS.has(targetUserId) || (!isGuid(targetUserId) && isPublic)) {
    const mock = MOCK_PROFILE_BY_ID[targetUserId];
    return mock ? structuredClone(mock) : null;
  }

  if (isPublic) {
    const response = await apiClient.get<ApiResponse<PublicProfileDto>>(
      `/profile/${targetUserId}`
    );
    const payload = unwrapProfileEnvelope(response.data);
    return payload ? mapPublicProfile(payload) : null;
  }

  const response = await apiClient.get<ApiResponse<MenteeOwnProfileDto | MentorOwnProfileDto>>(
    '/profile/me'
  );
  const payload = unwrapProfileEnvelope(response.data);

  if (!payload) {
    return null;
  }

  if ('yearsOfExperience' in payload) {
    return mapOwnMentorProfile(payload);
  }

  return mapOwnMenteeProfile(payload);
}

/** Demo links for QA: open another user's public profile */
export const PROFILE_DEMO_ROUTES = {
  publicMentor: DEMO_PUBLIC_MENTOR_ID,
  publicMentee: DEMO_PUBLIC_MENTEE_ID,
} as const;
