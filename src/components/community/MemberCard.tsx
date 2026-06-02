/**
 * MemberCard Component
 * Displays member information in a reusable card format
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, Shield, MoreHorizontal } from 'lucide-react';
import type { CommunityMember } from '../../pages/community/types';
import type { CommunityRoleName } from '../../constants/communityRoles';
import { communityRoleLabel } from '../../constants/communityRoles';

interface MemberCardProps {
  member: CommunityMember;
  onMessage?: (memberId: string) => void;
  onRemove?: (memberId: string) => void;
  onBan?: (memberId: string) => void;
  onChangeRole?: (
    memberId: string,
    newRole: Extract<CommunityRoleName, 'Admin' | 'Member'>
  ) => void;
  canChangeRoles?: boolean;
  canModerate?: boolean;
  showMessageButton?: boolean;
  isCompact?: boolean;
}

const roleBadgeStyles: Record<
  CommunityRoleName,
  string
> = {
  Owner: 'bg-violet-100 text-violet-700',
  Admin: 'bg-emerald-100 text-emerald-700',
  Member: 'bg-slate-100 text-slate-600',
};

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onMessage,
  onRemove,
  onBan,
  onChangeRole,
  canChangeRoles = false,
  canModerate = false,
  showMessageButton = true,
  isCompact = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener('click', handleClick);
    return () =>
      window.removeEventListener(
        'click',
        handleClick
      );
  }, []);

  const isOwner = member.role === 'Owner';
  const showModerationMenu =
    !isOwner &&
    (canModerate || canChangeRoles);
  const showPromoteAction =
    canChangeRoles &&
    member.role === 'Member' &&
    !!onChangeRole;
  const showDemoteAction =
    canChangeRoles &&
    member.role === 'Admin' &&
    !!onChangeRole;
  const showRemoveAction =
    canModerate && !isOwner && !!onRemove;
  const showBanAction =
    canModerate && !isOwner && !!onBan;

  return (
    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white transition hover:shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={member.avatar}
            alt={member.name}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-800">
                {member.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${roleBadgeStyles[member.role]}`}
              >
                <Shield size={10} />
                {communityRoleLabel(member.role)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Joined {member.joinedDate}
            </p>

            {!isCompact && member.bio && (
              <p className="mt-1 text-xs text-gray-500">
                {member.bio}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showMessageButton && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onMessage?.(member.id);
                }}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-50"
                aria-label="Message member"
              >
                <MessageSquareText size={14} />
              </button>
            )}

            {showModerationMenu &&
              (showRemoveAction ||
                showBanAction ||
                showPromoteAction ||
                showDemoteAction) && (
                <div
                  className="relative"
                  ref={ref}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpen((value) => !value);
                    }}
                    className="rounded-full p-2 text-gray-500 transition hover:bg-gray-50"
                    aria-label="Member actions"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {open && (
                    <div className="absolute bottom-full right-0 z-20 mb-2 w-48 rounded-lg border border-gray-100 bg-white shadow-lg">
                      {showPromoteAction && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onChangeRole?.(
                              member.id,
                              'Admin'
                            );
                            setOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          Change to Admin
                        </button>
                      )}

                      {showDemoteAction && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onChangeRole?.(
                              member.id,
                              'Member'
                            );
                            setOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          Change to Member
                        </button>
                      )}

                      {(showPromoteAction ||
                        showDemoteAction) &&
                        (showRemoveAction ||
                          showBanAction) && (
                          <div className="border-t border-gray-100" />
                        )}

                      {showRemoveAction && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onRemove?.(member.id);
                            setOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Remove Member
                        </button>
                      )}

                      {showBanAction && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onBan?.(member.id);
                            setOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Ban Member
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
