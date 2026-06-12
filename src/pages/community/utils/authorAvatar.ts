import { resolveProfilePictureUrl } from '../../../utils/profileImageUrl';

/** Resolve author display avatar. Returns empty string if no valid URL is found. */
export function resolveAuthorAvatar(
  _authorName: string,
  profilePictureUrl?: string | null
): string {
  return resolveProfilePictureUrl(profilePictureUrl) || '';
}
