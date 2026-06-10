import apiClient from '../../services/api';
import type { ApiResponse, AuthUser } from '../../types/api';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { mapProfilePictureFields, toStorageProfilePictureUrl } from '../../utils/profileImageUrl';
import type { ProfileEntity, ProfileExpertise, ProfileSubDomain, ProfileTechnology, SocialLink } from './types';
import {
  DEMO_PUBLIC_MENTEE_ID,
  DEMO_PUBLIC_MENTOR_ID,
  MOCK_PROFILE_BY_ID,
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

type BackendSubDomainDto = {
  id: number;
  name: string;
};

type BackendMenteeTechnologyDto = {
  technologyId: number;
  technologyName: string;
  experienceLevel: number;
  experienceLevelName: string;
};

type BackendMentorExpertiseDto = {
  technologyId: number;
  technologyName: string;
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
  technologies?: BackendMenteeTechnologyDto[];
  subDomains?: BackendSubDomainDto[];
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
  expertise?: BackendMentorExpertiseDto[];
  subDomains?: BackendSubDomainDto[];
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
  subDomains?: BackendSubDomainDto[];
  expertise?: BackendMentorExpertiseDto[];
  technologies?: BackendMenteeTechnologyDto[];
  currentLevel?: string | null;
  educationStatus?: string | null;
};

export type MenteeTechnologyInput = {
  technologyId: number;
  experienceLevel: number;
};

export type OwnProfileUpdatePayload = {
  bio?: string;

  profilePictureUrl?: string;
  linkedInUrl?: string;
  pastExperience?: string;
  socialLinks?: SocialLink[];
  technologyInterests?: MenteeTechnologyInput[];
  expertiseTechnologyIds?: number[];
  subDomainIds?: number[];
  educationStatus?: string;
  currentLevel?: string;
  yearsOfExperience?: number;
};

export type SocialLinkInput = SocialLink;

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

export function normalizeSocialPlatform(label: string): ProfileEntity['socialLinks'][number]['platform'] {
  const lower = label.toLowerCase();
  if (lower.includes('linkedin')) return 'linkedin';
  if (lower.includes('behance')) return 'behance';
  if (lower.includes('portfolio')) return 'portfolio';
  return 'other';
}

export function mentorLinkedInSyntheticId(userId: string): string {
  return `${userId}-linkedin`;
}

export function isMentorLinkedInSyntheticId(linkId: string, userId: string): boolean {
  return linkId === mentorLinkedInSyntheticId(userId);
}

function isLinkedInLabel(label: string): boolean {
  return label.toLowerCase().includes('linkedin');
}

function linkUrlFromDto(item: BackendLinkDto): string {
  const raw = item as BackendLinkDto & { URL?: string };
  return (raw.url ?? raw.URL ?? '').trim();
}

export function validateSocialLinkUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return 'URL is required';
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return 'URL must start with http:// or https://';
  }

  return null;
}

export function validateSocialLinks(links: SocialLink[]): string | null {
  for (const link of links) {
    const error = validateSocialLinkUrl(link.url);
    if (error) {
      const name = link.label.trim() || 'Link';
      return `${name}: ${error}`;
    }
  }

  return null;
}

function buildMentorSocialLinks(
  userId: string,
  tableLinks: BackendLinkDto[],
  linkedInUrl?: string | null
): ProfileEntity['socialLinks'] {
  const columnLinkedIn = linkedInUrl?.trim() || '';
  const mapped = mapLinks(tableLinks).filter((link) => {
    if (!columnLinkedIn) {
      return true;
    }

    return !(
      isLinkedInLabel(link.label) &&
      link.url.trim().toLowerCase() === columnLinkedIn.toLowerCase()
    );
  });

  if (columnLinkedIn) {
    mapped.unshift({
      id: mentorLinkedInSyntheticId(userId),
      platform: 'linkedin',
      label: 'LinkedIn',
      url: columnLinkedIn,
    });
  }

  return mapped;
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

const EXPERIENCE_LEVEL_FORM_TO_API: Record<string, number> = {
  none: 1,
  beginner: 2,
  intermediate: 3,
  advanced: 4,
  expert: 4,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
};

const EXPERIENCE_LEVEL_API_TO_FORM: Record<number, string> = {
  1: 'none',
  2: 'beginner',
  3: 'intermediate',
  4: 'advanced',
};

export function experienceLevelToApiValue(level: string): number {
  const normalized = level.trim().toLowerCase();
  if (EXPERIENCE_LEVEL_FORM_TO_API[normalized] != null) {
    return EXPERIENCE_LEVEL_FORM_TO_API[normalized];
  }

  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && EXPERIENCE_LEVEL_API_TO_FORM[numeric]) {
    return numeric;
  }

  return 2;
}

export function experienceLevelToFormValue(level: number): string {
  return EXPERIENCE_LEVEL_API_TO_FORM[level] ?? 'beginner';
}

/** Select option value aligned with `/lookup/experience-levels` (enum int as string). */
export function experienceLevelToSelectValue(level: number): string {
  if (Number.isFinite(level) && EXPERIENCE_LEVEL_API_TO_FORM[level]) {
    return String(level);
  }
  return '2';
}

const ENUM_NAME_TO_SELECT_VALUE: Record<string, Record<string, string>> = {
  educationStatus: {
    freshman: '1',
    sophomore: '2',
    junior: '3',
    senior: '4',
    graduate: '5',
  },
  currentLevel: {
    beginner: '1',
    junior: '2',
    mid: '3',
    senior: '4',
  },
};

export function enumNameToSelectValue(
  field: 'educationStatus' | 'currentLevel',
  apiValue?: string | null
): string {
  const trimmed = apiValue?.trim();
  if (!trimmed) {
    return '';
  }

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  return ENUM_NAME_TO_SELECT_VALUE[field][trimmed.toLowerCase()] ?? '';
}

export function selectValueToEnumName(
  options: { label: string; value: string }[],
  selectValue: string
): string {
  const trimmed = selectValue.trim();
  if (!trimmed) {
    return '';
  }

  const matched = options.find((option) => option.value === trimmed);
  return matched?.label ?? trimmed;
}

export const MENTOR_YEARS_OPTIONS = [
  { label: '2-5 years', value: '2-5' },
  { label: '5-10 years', value: '5-10' },
  { label: '10-15 years', value: '10-15' },
  { label: '15+ years', value: '15plus' },
] as const;

export function mentorYearsToSelectValue(years: number | string | undefined | null): string {
  if (years == null || years === '') {
    return '';
  }

  const parsed = typeof years === 'string' ? Number.parseInt(years, 10) : years;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '';
  }

  if (parsed >= 15) {
    return '15plus';
  }
  if (parsed >= 10) {
    return '10-15';
  }
  if (parsed >= 5) {
    return '5-10';
  }
  if (parsed >= 2) {
    return '2-5';
  }

  return '';
}

export function mentorYearsSelectToApiValue(value: string): number {
  return Number.parseInt(value.split('-')[0], 10) || 0;
}

/** Human-readable mentor experience range for profile display. */
export function formatMentorYearsDisplay(
  years: number | string | undefined | null
): string | null {
  const selectValue = mentorYearsToSelectValue(years);
  if (!selectValue) {
    return null;
  }

  const matched = MENTOR_YEARS_OPTIONS.find((option) => option.value === selectValue);
  return matched?.label ?? null;
}

function mapSubDomains(items?: BackendSubDomainDto[]): ProfileSubDomain[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    name: item.name.trim(),
  }));
}

function mapMenteeTechnologies(items?: BackendMenteeTechnologyDto[]): ProfileTechnology[] {
  return (items ?? []).map((item) => ({
    technologyId: item.technologyId,
    technologyName: item.technologyName.trim(),
    experienceLevel: item.experienceLevel,
    experienceLevelName: item.experienceLevelName?.trim() || experienceLevelToFormValue(item.experienceLevel),
  }));
}

function mapMentorExpertise(items?: BackendMentorExpertiseDto[]): ProfileExpertise[] {
  return (items ?? []).map((item) => ({
    technologyId: item.technologyId,
    technologyName: item.technologyName.trim(),
  }));
}

function syncLegacySkillFields(profile: ProfileEntity): void {
  profile.relevantExpertise = profile.subDomains.map((item) => item.name);
  profile.tools =
    profile.role === 'mentor'
      ? profile.expertise.map((item) => ({
          technologyId: item.technologyId,
          name: item.technologyName,
          level: '',
        }))
      : profile.technologies.map((item) => ({
          technologyId: item.technologyId,
          name: item.technologyName,
          level: experienceLevelToFormValue(item.experienceLevel),
        }));
}

function mapLinks(links: BackendLinkDto[]): ProfileEntity['socialLinks'] {
  return [...links]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((item) => ({
      id: item.linkId,
      platform: normalizeSocialPlatform(item.label),
      label: item.label.trim(),
      url: linkUrlFromDto(item),
    }));
}

function mapOwnMenteeProfile(profile: MenteeOwnProfileDto): ProfileEntity {
  const displayName = normalizeName(profile.firstName, profile.lastName) || 'Mentee';
  const avatar = mapProfilePictureFields(profile.profilePictureUrl);
  const subDomains = mapSubDomains(profile.subDomains);
  const technologies = mapMenteeTechnologies(profile.technologies);

  const entity: ProfileEntity = {
    userId: profile.userId,
    role: 'mentee',
    displayName,
    headline: profile.currentLevel?.trim() || profile.domainName?.trim() || 'Mentee',
    location: normalizeLocation(profile.countryName, profile.countryCode),
    countryCode: profile.countryCode?.trim() || undefined,
    email: profile.email,
    ...avatar,
    bio: normalizeBio(profile.bio),
    socialLinks: mapLinks(profile.links),
    education: mapEducation(profile.education),
    experience: [],
    domainId: undefined,
    domainName: profile.domainName?.trim() || undefined,
    educationStatus: profile.educationStatus?.trim() || undefined,
    currentLevel: profile.currentLevel?.trim() || undefined,
    yearsOfExperience: undefined,
    relevantExpertise: [],
    tools: [],
    subDomains,
    technologies,
    expertise: [],
  };

  syncLegacySkillFields(entity);
  return entity;
}

function mapOwnMentorProfile(profile: MentorOwnProfileDto): ProfileEntity {
  const displayName = normalizeName(profile.firstName, profile.lastName) || 'Mentor';
  const avatar = mapProfilePictureFields(profile.profilePictureUrl);

  const socialLinks = buildMentorSocialLinks(
    profile.userId,
    profile.links,
    profile.linkedInUrl
  );
  const subDomains = mapSubDomains(profile.subDomains);
  const expertise = mapMentorExpertise(profile.expertise);

  const entity: ProfileEntity = {
    userId: profile.userId,
    role: 'mentor',
    displayName,
    headline: profile.domainName?.trim() || 'Mentor',
    location: normalizeLocation(profile.countryName, profile.countryCode),
    countryCode: profile.countryCode?.trim() || undefined,
    email: profile.email,
    ...avatar,
    bio: normalizeBio(profile.bio),
    socialLinks,
    education: mapEducation(profile.education),
    experience: [],
    domainId: undefined,
    domainName: profile.domainName?.trim() || undefined,
    yearsOfExperience: String(profile.yearsOfExperience ?? ''),
    relevantExpertise: [],
    tools: [],
    subDomains,
    technologies: [],
    expertise,
  };

  syncLegacySkillFields(entity);
  return entity;
}

function mapPublicProfile(profile: PublicProfileDto): ProfileEntity {
  const role = profile.role?.toLowerCase() === 'mentor' ? 'mentor' : 'mentee';
  const displayName = normalizeName(profile.firstName, profile.lastName) || (role === 'mentor' ? 'Mentor' : 'Mentee');
  const avatar = mapProfilePictureFields(profile.profilePictureUrl);

  return {
    userId: profile.userId,
    role,
    displayName,
    headline: profile.domainName?.trim() || '',
    location: normalizeLocation(profile.countryName),
    email: '',
    ...avatar,
    bio: normalizeBio(profile.bio),
    socialLinks: mapLinks(profile.links),
    education: mapEducation(profile.education),
    experience: [],
    domainId: undefined,
    yearsOfExperience: profile.yearsOfExperience == null ? undefined : String(profile.yearsOfExperience),
    relevantExpertise: [],
    tools: [],
    subDomains: mapSubDomains(profile.subDomains),
    technologies: mapMenteeTechnologies(profile.technologies),
    expertise: mapMentorExpertise(profile.expertise),
    currentLevel: profile.currentLevel?.trim() || undefined,
    educationStatus: profile.educationStatus?.trim() || undefined,
    domainName: profile.domainName?.trim() || undefined,
    reviewAverage: profile.averageRating ?? undefined,
    reviewTotal: profile.totalReviews ?? undefined,
    followerCount: profile.followerCount ?? undefined,
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

  const payload: Record<string, string | number | undefined> = {
    bio: toNullableTrimmed(patch.bio),
    profilePictureUrl: toStorageProfilePictureUrl(patch.profilePictureUrl),
    pastExperience: toNullableTrimmed(patch.pastExperience),
  };

  if (role === 'mentor') {
    if (patch.linkedInUrl !== undefined) {
      payload.linkedInUrl = patch.linkedInUrl.trim();
    }
    if (patch.yearsOfExperience != null) {
      payload.yearsOfExperience = patch.yearsOfExperience;
    }
  } else {
    if (patch.educationStatus !== undefined) {
      payload.educationStatus = patch.educationStatus.trim();
    }
    if (patch.currentLevel !== undefined) {
      payload.currentLevel = patch.currentLevel.trim();
    }
  }

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

  try {
    await Promise.all(operations);
    return true;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to save education. Please try again.'));
  }
}

/**
 * Sync profile link rows via POST / PUT / DELETE.
 * Mentor LinkedIn (synthetic id) is persisted through updateOwnProfile.linkedInUrl instead.
 */
export async function saveSocialLinks(
  viewer: AuthUser,
  entries: SocialLink[]
): Promise<boolean> {
  const isMentor = viewer.role?.toLowerCase() === 'mentor';

  const normalized = entries
    .map((entry, index) => ({
      id: entry.id,
      label: entry.label.trim() || 'Link',
      url: entry.url.trim(),
      platform: entry.platform,
      displayOrder: index + 1,
    }))
    .filter((entry) => entry.url);

  const tableLinks = isMentor
    ? normalized.filter((entry) => !isMentorLinkedInSyntheticId(entry.id, viewer.userId))
    : normalized;

  const existing = tableLinks.filter((entry) => isGuidString(entry.id));
  const incomingIds = new Set(existing.map((entry) => entry.id));

  const storedResponse = await apiClient.get<ApiResponse<MenteeOwnProfileDto | MentorOwnProfileDto>>(
    '/profile/me'
  );
  const storedProfile = unwrapProfileEnvelope(storedResponse.data);
  const currentLinks = storedProfile?.links ?? [];

  const operations: Promise<unknown>[] = [];

  for (const item of tableLinks) {
    const payload = {
      label: item.label,
      url: item.url,
      displayOrder: item.displayOrder,
    };

    if (isGuidString(item.id)) {
      operations.push(apiClient.put(`/profile/me/links/${item.id}`, payload));
    } else {
      operations.push(apiClient.post('/profile/me/links', payload));
    }
  }

  const removals = currentLinks.filter((entry) => !incomingIds.has(entry.linkId));
  for (const removed of removals) {
    operations.push(apiClient.delete(`/profile/me/links/${removed.linkId}`));
  }

  await Promise.all(operations);
  return true;
}

export async function saveMenteeTechnologies(
  interests: MenteeTechnologyInput[]
): Promise<void> {
  const response = await apiClient.put<ApiResponse<unknown>>('/profile/me/technologies', {
    technologyInterests: interests,
  });

  if (response.data.success !== true) {
    throw new Error(response.data.message || 'Failed to update technologies.');
  }
}

export async function saveMentorExpertise(technologyIds: number[]): Promise<void> {
  const response = await apiClient.put<ApiResponse<unknown>>('/profile/me/expertise', {
    technologyIds,
  });

  if (response.data.success !== true) {
    throw new Error(response.data.message || 'Failed to update expertise.');
  }
}

export async function saveSubDomains(subDomainIds: number[]): Promise<void> {
  const response = await apiClient.put<ApiResponse<unknown>>('/profile/me/subdomains', {
    subDomainIds,
  });

  if (response.data.success !== true) {
    throw new Error(response.data.message || 'Failed to update subdomains.');
  }
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

export async function getPublicMenteePrograms(menteeId: string) {
  const response = await apiClient.get(`/profile/mentee/${menteeId}/programs`);
  return response.data;
}
