
import { Flag, Mail, MapPin, Pencil } from 'lucide-react';
import type { ProfileEntity } from '../../pages/profile/types';
import { ProfileAvatar } from './ProfileAvatar';

export interface ProfileBannerProps {
  profile: ProfileEntity;
  isOwner: boolean;
  showFollow?: boolean;
  showMessage?: boolean;
  isFollowing?: boolean;
  followLoading?: boolean;
  messageLoading?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
  onReport?: () => void;
}

export function ProfileBanner({
  profile,
  isOwner,
  showFollow = false,
  showMessage = false,
  isFollowing = false,
  followLoading = false,
  messageLoading = false,
  onEdit,
  onFollow,
  onMessage,
  onReport,
}: ProfileBannerProps) {
  const showVisitorActions = !isOwner && (showFollow || showMessage);

  return (
    <header className="relative overflow-visible rounded-3xl bg-primary px-6 py-8 text-white shadow-lg shadow-primary/25 md:px-10 md:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ProfileAvatar
            pictureUrl={profile.profilePicturePath ?? profile.avatarUrl}
            name={profile.displayName}
            alt=""
            className="h-28 w-28 shrink-0 rounded-full border-4 border-white/30 object-cover shadow-lg sm:h-32 sm:w-32"
          />
          <div className="min-w-0 space-y-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{profile.displayName}</h1>
              {profile.headline ? (
                <p className="mt-1 text-sm font-medium uppercase tracking-wide text-white/80">{profile.headline}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
              {profile.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} className="shrink-0 opacity-90" />
                  {profile.location}
                </span>
              ) : null}
              {profile.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={16} className="shrink-0 opacity-90" />
                  {profile.email}
                </span>
              ) : null}
            </div>
            {profile.socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4">
                {profile.socialLinks.map((link) => (
                  <a key={link.id} href={link.url} className="!text-white transition hover:!text-white/90 visited:!text-white">
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                aria-label="Edit profile"
              >
                <Pencil size={18} />
              </button>
            </>
          ) : showVisitorActions ? (
            <>
              {showFollow ? (
                <button
                  type="button"
                  onClick={onFollow}
                  disabled={followLoading}
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {followLoading ? 'Updating…' : isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : null}
              {showMessage ? (
                <button
                  type="button"
                  onClick={onMessage}
                  disabled={messageLoading}
                  className="rounded-full bg-[#4DB6AC] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3da096] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {messageLoading ? 'Opening...' : 'Message'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onReport}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Report"
              >
                <Flag size={18} />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
