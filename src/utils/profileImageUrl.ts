import { getBackendOrigin, toAbsoluteFileUrl } from '../services/messagingService';

/** Resolve a backend profile picture path for use in `<img src>`. */
export function resolveProfilePictureUrl(url?: string | null): string {
  const trimmed = url?.trim();
  if (!trimmed) {
    return '';
  }

  const normalized = trimmed.replace(/\\/g, '/');
  return toAbsoluteFileUrl(normalized);
}

/**
 * Normalize a profile picture value to the relative path the API expects (`/uploads/...`).
 * Strips the API host when the value was previously resolved for display.
 */
export function toStorageProfilePictureUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  const origin = getBackendOrigin();
  if (trimmed.startsWith(origin)) {
    const path = trimmed.slice(origin.length);
    return path.startsWith('/') ? path : `/${path}`;
  }

  return trimmed;
}


export function mapProfilePictureFields(profilePictureUrl?: string | null): {
  profilePicturePath: string;
  avatarUrl: string;
} {
  const profilePicturePath = toStorageProfilePictureUrl(profilePictureUrl) ?? '';

  return {
    profilePicturePath,
    avatarUrl: resolveProfilePictureUrl(profilePicturePath),
  };
}
