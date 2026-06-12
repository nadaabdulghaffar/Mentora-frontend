/**
 * MemberRequest Component
 * Displays a member-like row with actions menu
 */

import React, { useEffect, useRef, useState } from 'react';
import { MessageSquareText, MoreHorizontal } from 'lucide-react';
import type { MemberRequest } from '../../pages/community/types';
import { ProfileAvatar } from '../profile/ProfileAvatar';

interface MemberRequestProps {
  request: MemberRequest;
  onMessage?: (requestId: string) => void;
  onRemove?: (requestId: string) => void;
  onBan?: (requestId: string) => void;
  onChangeRole?: (requestId: string, newRole: 'admin' | 'member') => void;
  onMoreOptions?: (requestId: string) => void;
}

export const MemberRequestCard: React.FC<MemberRequestProps> = ({
  request,
  onMessage,
  onRemove,
  onBan,
  onChangeRole,
  onMoreOptions,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const roleValue = request.role.toLowerCase();
  const isAdminLike = roleValue.includes('admin') || roleValue.includes('moderator');

  return (
    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white transition hover:shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            pictureUrl={request.avatar}
            name={request.name}
            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
          />

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-800 text-sm">{request.name}</h4>
            <p className="text-xs text-gray-500">{request.role}</p>
            <p className="mt-1 text-xs text-gray-600 line-clamp-1">{request.bio}</p>
            <p className="mt-1 text-xs text-gray-400">{request.requestedAt}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMessage?.(request.id);
              }}
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-50"
              aria-label="Message request"
            >
              <MessageSquareText size={15} />
            </button>

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
                <div className="absolute bottom-full right-0 z-20 mb-2 w-44 rounded-lg border border-gray-100 bg-white shadow-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove?.(request.id);
                      onMoreOptions?.(request.id);
                      setOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBan?.(request.id);
                      onMoreOptions?.(request.id);
                      setOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Ban
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeRole?.(request.id, isAdminLike ? 'member' : 'admin');
                      onMoreOptions?.(request.id);
                      setOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {isAdminLike ? 'Change to member' : 'Change to admin'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
