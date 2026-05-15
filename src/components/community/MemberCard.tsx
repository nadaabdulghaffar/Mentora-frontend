/**
 * MemberCard Component
 * Displays member information in a reusable card format
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, UserPlus, UserMinus, Shield, MoreHorizontal } from 'lucide-react';
import type { CommunityMember } from '../../pages/community/types';

interface MemberCardActions {
  onRemove?: (memberId: string) => void;
  onBan?: (memberId: string) => void;
  onChangeRole?: (memberId: string, newRole: 'admin' | 'moderator' | 'member') => void;
}

interface MemberCardProps extends MemberCardActions {
  member: CommunityMember;
  onFollow?: (memberId: string) => void;
  onUnfollow?: (memberId: string) => void;
  onMessage?: (memberId: string) => void;
  showFollowButton?: boolean;
  showMessageButton?: boolean;
  isCompact?: boolean;
}

/**
 * MemberCard - Displays a community member's profile card
 * Features:
 * - Member avatar and basic info
 * - Role badge (admin/moderator)
 * - Bio/description
 * - Join date
 * - Action buttons (follow, message, more options)
 * - Compact and full layouts
 */
export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onFollow,
  onUnfollow,
  onMessage,
  onRemove,
  onBan,
  onChangeRole,
  showFollowButton = true,
  showMessageButton = true,
  isCompact = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const roleLabel = member.role === 'admin' ? 'owner' : member.role === 'moderator' ? 'admin' : member.role;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
  return (
    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white transition hover:shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={member.avatar}
            alt={member.name}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm truncate">{member.name}</h3>
              {member.role !== 'member' && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${member.role === 'admin' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Shield size={10} />
                  {roleLabel}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">{member.bio || member.joinedDate}</p>

            {!isCompact && member.bio && (
              <p className="mt-1 text-xs text-gray-500">{member.joinedDate}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {(showFollowButton || showMessageButton) && (
              <>
                {showFollowButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (member.isFollowing) onUnfollow?.(member.id);
                      else onFollow?.(member.id);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${member.isFollowing ? 'bg-card border border-gray-200 text-slate-800' : 'bg-primary text-white'}`}
                  >
                    {member.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}

                {showMessageButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessage?.(member.id);
                    }}
                    className="rounded-full p-2 text-gray-500 transition hover:bg-gray-50"
                    aria-label="Message member"
                  >
                    <MessageSquareText size={14} />
                  </button>
                )}
              </>
            )}

            {(onRemove || onBan || onChangeRole) && (
              <div className="relative" ref={ref}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((s) => !s);
                  }}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-50"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>

                {open && (
                  <div className="absolute bottom-full right-0 z-20 mb-2 w-44 rounded-lg border border-gray-100 bg-card shadow-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.(member.id);
                        setOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBan?.(member.id);
                        setOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Ban
                    </button>
                    <div className="border-t border-gray-100" />
                    {member.role !== 'member' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeRole?.(member.id, 'member');
                          setOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        Change to member
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeRole?.(member.id, 'admin');
                          setOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        Change to admin
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
