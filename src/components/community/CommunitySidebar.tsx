
/**
 * CommunitySidebar Component
 * Displays community information and meta content
 */

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Calendar, Link } from 'lucide-react';
import type { Community } from '../../pages/community/types';

interface CommunitySidebarProps {
  community: Community;
  onSettings?: () => void;
  onShare?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  isLoading?: boolean;
}

/**
 * CommunitySidebar - Displays community information
 * Features:
 * - Community cover image
 * - Community name and description
 * - Member count
 * - Created date
 * - Join/Leave button
 * - Settings and share buttons
 */
export const CommunitySidebar: React.FC<
  CommunitySidebarProps
> = ({
  community,
  onSettings,
  onShare,
  onJoin,
  onLeave,
  isLoading = false,
}) => {
  const [shareOpen, setShareOpen] = useState(false);

  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return `${window.location.origin}/community/${community.id}`;
  }, [community.id]);

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareOpen(false);
    } catch {
      // Keep dialog open if clipboard access is denied.
    }
  };

  const shareDialog =
    shareOpen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        role="presentation"
        onClick={() => setShareOpen(false)}
      >
        <div
          role="dialog"
          aria-labelledby="community-share-title"
          className="w-full max-w-md rounded-2xl border border-white/15 bg-white p-4 text-slate-900 shadow-2xl shadow-black/20"
          onClick={(e) => e.stopPropagation()}
        >
          <p id="community-share-title" className="text-sm font-semibold text-[#1F2533]">
            Share community
          </p>
          <p className="mt-1 text-xs text-[#6B7289]">
            Copy this community link and send it to anyone.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D8DCE8] bg-[#F8F9FD] px-3 py-2">
            <Link size={16} className="shrink-0 text-primary" aria-hidden />
            <input
              readOnly
              value={shareLink}
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
      </div>,
      document.body
    );

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {shareDialog}
      {/* Cover */}
      <div className="h-32 w-full bg-gray-100">
        {community.cover ? (
          <img
            src={
              community.cover
            }
            alt={
              community.name
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary to-primary-dark" />
        )}
      </div>

      <div className="p-4 sm:p-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {community.name}
          </h3>

          {community.domain && (
            <p className="mt-1 text-xs font-semibold text-primary uppercase tracking-wide">
              {community.domain}
            </p>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          {
            community.description
          }
        </p>

        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />

            <span>
              {community.memberCount.toLocaleString()}{' '}
              members
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />

            <span>
              Created{' '}
              {
                community.createdDate
              }
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {community.isJoined &&
          community.currentUserRole !==
            'Owner' ? (
            <button
              onClick={
                onLeave
              }
              disabled={
                isLoading
              }
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-800 bg-white"
            >
              Leave
              Community
            </button>
          ) : !community.isJoined ? (
            <button
              onClick={
                onJoin
              }
              disabled={
                isLoading
              }
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Join
              Community
            </button>
          ) : null}

          <div className="flex gap-2">
            {community.canManage && (
              <button
                onClick={
                  onSettings
                }
                disabled={
                  isLoading
                }
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
              >
                Settings
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShareOpen(true);
                onShare?.();
              }}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
