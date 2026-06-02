const COMMUNITY_PATH_PATTERN = /^\/community\/([^/]+)/;

/**
 * Resolves community id from a thread field or the current /community/:id route.
 */
export function resolveCommunityIdForShare(
  communityId?: string,
  pathname?: string
): string | undefined {
  if (communityId) {
    return communityId;
  }
  if (typeof window !== 'undefined') {
    const path = pathname ?? window.location.pathname;
    const match = path.match(COMMUNITY_PATH_PATTERN);
    return match?.[1];
  }
  return undefined;
}

/**
 * Builds a shareable URL that opens a specific post on the community page.
 */
export function buildCommunityPostShareUrl(
  postId: string,
  communityId?: string
): string {
  if (typeof window === 'undefined' || !postId) {
    return '';
  }

  const resolvedCommunityId = resolveCommunityIdForShare(communityId);
  if (!resolvedCommunityId) {
    return `${window.location.origin}${window.location.pathname}?thread=${postId}`;
  }

  return `${window.location.origin}/community/${resolvedCommunityId}?thread=${postId}`;
}
