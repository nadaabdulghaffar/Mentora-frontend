/** Reads `MentorProfileId` from the stored access token (matches backend JWT claim). */
export function readMentorProfileIdFromToken(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;

    const payload = JSON.parse(atob(payloadSegment)) as Record<string, unknown>;
    const id = payload.MentorProfileId ?? payload.mentorProfileId;
    return typeof id === 'string' && id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

/**
 * Mentor profile PK equals `UserId` in this codebase; when viewing own profile,
 * prefer the JWT claim so we match rows keyed by `MentorProfileId`.
 */
export function resolveMentorProfileIdForApi(
  profileUserId: string,
  isOwner: boolean
): string {
  if (isOwner) {
    const fromToken = readMentorProfileIdFromToken();
    if (fromToken) return fromToken;
  }
  return profileUserId;
}
