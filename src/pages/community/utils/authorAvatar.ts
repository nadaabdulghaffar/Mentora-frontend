import {
  getProfileAvatarFallback,
  resolveProfilePictureUrl,
} from '../../../utils/profileImageUrl';

/** Resolve author display avatar (API path → absolute URL, with name-based fallback). */
export function resolveAuthorAvatar(
  authorName: string,
  profilePictureUrl?: string | null
): string {
  const resolved = resolveProfilePictureUrl(profilePictureUrl);
  return resolved || getProfileAvatarFallback(authorName);
}
