import { useEffect, useMemo, useState } from 'react';
import {
  getProfileAvatarFallback,
  resolveProfilePictureUrl,
} from '../../utils/profileImageUrl';

export interface ProfileAvatarProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Relative or absolute profile picture URL from the API or upload response. */
  pictureUrl?: string | null;
  /** Used for the generated fallback when the image fails to load. */
  name?: string;
}

export function ProfileAvatar({
  pictureUrl,
  name,
  alt = '',
  className,
  ...imgProps
}: ProfileAvatarProps) {
  const resolvedSrc = useMemo(
    () => resolveProfilePictureUrl(pictureUrl),
    [pictureUrl]
  );
  const fallbackSrc = useMemo(() => getProfileAvatarFallback(name), [name]);
  const [src, setSrc] = useState(() => resolvedSrc || fallbackSrc);

  useEffect(() => {
    setSrc(resolvedSrc || fallbackSrc);
  }, [resolvedSrc, fallbackSrc]);

  const handleError = () => {
    if (src !== fallbackSrc) {
      setSrc(fallbackSrc);
    }
  };

  return (
    <img
      {...imgProps}
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
