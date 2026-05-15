import { useMemo, useState } from 'react';
import { Flag, Link, Mail, MapPin, Pencil, Settings, Share2 } from 'lucide-react';
import type { ProfileEntity } from '../../pages/profile/types';

export interface ProfileBannerProps {
  profile: ProfileEntity;
  isOwner: boolean;
  onEdit?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
  onReport?: () => void;
}

export function ProfileBanner({
  profile,
  isOwner,
  onEdit,
  onSettings,
  onShare,
  onFollow,
  onMessage,
  onReport,
}: ProfileBannerProps) {
  const isMentor = profile.role === 'mentor';
  const [shareOpen, setShareOpen] = useState(false);

  const profileLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.location.href;
  }, []);

  const handleCopyLink = async () => {
    if (!profileLink) return;

    try {
      await navigator.clipboard.writeText(profileLink);
      setShareOpen(false);
    } catch {
      // No-op: keep the popup open if clipboard access is blocked.
    }
  };

  return (
    <header className="relative overflow-visible rounded-3xl bg-primary px-6 py-8 text-white shadow-lg shadow-primary/25 md:px-10 md:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <img
            src={profile.avatarUrl}
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
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} className="shrink-0 opacity-90" />
                {profile.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail size={16} className="shrink-0 opacity-90" />
                {profile.email}
              </span>
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
              <button
                type="button"
                onClick={onSettings}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                aria-label="Settings"
              >
                <Settings size={18} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShareOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                  aria-label="Share profile"
                >
                  <Share2 size={18} />
                </button>

                {shareOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-3 w-80 rounded-2xl border border-white/15 bg-white p-4 text-slate-900 shadow-2xl shadow-black/20">
                    <p className="text-sm font-semibold text-[#1F2533]">Share profile</p>
                    <p className="mt-1 text-xs text-[#6B7289]">Copy this link and send it to anyone.</p>
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D8DCE8] bg-[#F8F9FD] px-3 py-2">
                      <Link size={16} className="shrink-0 text-primary" />
                      <input
                        readOnly
                        value={profileLink}
                        className="min-w-0 flex-1 bg-transparent text-xs text-[#1F2533] outline-none"
                      />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShareOpen(false)}
                        className="rounded-xl border border-[#D8DCE8] px-4 py-2 text-sm font-semibold text-[#6B7289] transition hover:bg-[#F8F9FD]"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : isMentor ? (
            <>
              <button
                type="button"
                onClick={onFollow}
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
              >
                Follow
              </button>
              <button
                type="button"
                onClick={onMessage}
                className="rounded-full bg-[#4DB6AC] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3da096]"
              >
                Message
              </button>
              <button
                type="button"
                onClick={onReport}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Report"
              >
                <Flag size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onMessage}
                className="rounded-full bg-[#4DB6AC] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3da096]"
              >
                Message
              </button>
              <button
                type="button"
                onClick={onReport}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Report"
              >
                <Flag size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
