/**
 * Profile data access layer.
 * Replace `getProfile` implementation with HTTP calls when the API is ready.
 */

import type { AuthUser } from '../../types/api';
import type { ProfileEntity } from './types';
import {
  DEMO_PUBLIC_MENTEE_ID,
  DEMO_PUBLIC_MENTOR_ID,
  MOCK_PROFILE_BY_ID,
  menteeTemplateForOwner,
  mentorTemplateForOwner,
} from './mockData';

export function isPublicProfileView(
  viewer: AuthUser,
  routeUserId: string | undefined
): boolean {
  return !!routeUserId && routeUserId !== viewer.userId;
}

/**
 * Resolve which profile role to render for this target id.
 * - Owner: use viewer's role.
 * - Public: read from mock store (future: API returns role + payload).
 */
export function getProfileForRoute(
  viewer: AuthUser,
  routeUserId: string | undefined
): ProfileEntity | null {
  const targetUserId = routeUserId ?? viewer.userId;
  const isPublic = !!(routeUserId && routeUserId !== viewer.userId);

  if (isPublic) {
    const mock = MOCK_PROFILE_BY_ID[targetUserId];
    return mock ? structuredClone(mock) : null;
  }

  const role = viewer.role?.toLowerCase() === 'mentor' ? 'mentor' : 'mentee';
  const mockOverride = MOCK_PROFILE_BY_ID[targetUserId];
  if (mockOverride && targetUserId === viewer.userId) {
    return structuredClone(mockOverride);
  }

  if (role === 'mentor') {
    return mentorTemplateForOwner(
      viewer.userId,
      viewer.firstName,
      viewer.lastName ?? '',
      viewer.email
    );
  }
  return menteeTemplateForOwner(
    viewer.userId,
    viewer.firstName,
    viewer.lastName ?? '',
    viewer.email
  );
}

/** Demo links for QA: open another user's public profile */
export const PROFILE_DEMO_ROUTES = {
  publicMentor: DEMO_PUBLIC_MENTOR_ID,
  publicMentee: DEMO_PUBLIC_MENTEE_ID,
} as const;
