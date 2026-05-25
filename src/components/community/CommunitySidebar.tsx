
/**
 * CommunitySidebar Component
 * Displays community information and meta content
 */

import React from 'react';
import { Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate =
    useNavigate();

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Cover */}
      <div className="h-24 w-full bg-gray-100">
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
        <div className="flex items-center gap-3">
          <img
            src={
              community.avatar
            }
            alt={
              community.name
            }
            className="h-12 w-12 rounded-full border-2 border-white -mt-6 bg-white object-cover"
          />

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {community.name}
            </h3>

            {community.domain && (
              <p className="mt-1 text-xs font-semibold text-primary uppercase tracking-wide">
                {
                  community.domain
                }
              </p>
            )}
          </div>
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
              onClick={
                onShare
              }
              disabled={
                isLoading
              }
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
