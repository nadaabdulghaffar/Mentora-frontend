import { useEffect, useMemo, useState } from 'react';
import { resolveProfilePictureUrl } from '../../utils/profileImageUrl';

export interface ProfileAvatarProps {
  /** Relative or absolute profile picture URL from the API or upload response. */
  pictureUrl?: string | null;
  /** Used for the generated fallback when the image fails to load. */
  name?: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileAvatar({
  pictureUrl,
  name,
  alt = '',
  className = '',
  onClick,
}: ProfileAvatarProps) {
  const resolvedSrc = useMemo(
    () => resolveProfilePictureUrl(pictureUrl),
    [pictureUrl]
  );
  
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [resolvedSrc]);

  if (resolvedSrc && !imageError) {
    return (
      <img
        src={resolvedSrc}
        alt={alt || name || 'Avatar'}
        className={className}
        onError={() => setImageError(true)}
        onClick={onClick}
      />
    );
  }

  // Fallback to initials
  const initials = getInitials(name);
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center bg-[#6D5DD3] text-white font-semibold overflow-hidden shrink-0 ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
