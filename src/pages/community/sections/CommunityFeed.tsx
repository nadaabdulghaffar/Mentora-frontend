/**
 * CommunityFeed Section Component
 * Displays the main discussion feed with threads
 */

import React from 'react';
import { Send } from 'lucide-react';
import { PostCard } from '../../../components/community/PostCard';
import { ProfileAvatar } from '../../../components/profile/ProfileAvatar';
import type { CommunityThread } from '../types';
import authAPI from '../../../services/authService';
import { resolveAuthorAvatar } from '../utils/authorAvatar';

interface CommunityFeedSectionProps {
  threads: CommunityThread[];
  isLoading?: boolean;
  onThreadClick: (thread: CommunityThread) => void;
  onLike: (threadId: string) => void;
  onShare: (threadId: string) => void;
  onMoreOptions?: (threadId: string) => void;
  onCreatePost?: () => void;
  currentUserId?: string;
  onThreadEditRequest?: (thread: CommunityThread) => void;
  onThreadDelete?: (threadId: string) => void;
  currentUserAvatar?: string;
  currentUserDisplayName?: string;
}

/**
 * CommunityFeedSection - Main feed display with threads
 */
export const CommunityFeedSection: React.FC<CommunityFeedSectionProps> = ({
  threads,
  isLoading,
  onThreadClick,
  onLike,
  onShare,
  onMoreOptions,
  onCreatePost,
  currentUserId,
  onThreadEditRequest,
  onThreadDelete,
  currentUserAvatar,
  currentUserDisplayName,
}) => {
  const currentUser = authAPI.getCurrentUser();
  const fallbackDisplayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'You'
    : 'You';
  const resolvedDisplayName = currentUserDisplayName || fallbackDisplayName;

  const openCreatePost = () => {
    onCreatePost?.();
  };

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <button
          type="button"
          onClick={openCreatePost}
          className="flex w-full items-center gap-3 text-left"
        >
          <ProfileAvatar
            pictureUrl={currentUserAvatar || resolveAuthorAvatar(resolvedDisplayName, null)}
            name={resolvedDisplayName}
            alt={resolvedDisplayName}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="w-full rounded-xl bg-pane px-4 py-2.5 text-sm text-gray-500">
            Share something with this community...
          </span>
        </button>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={openCreatePost}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
          >
            <Send size={14} />
            Create Post
          </button>
        </div>
      </div>

      {/* Threads Feed - Dynamic Rendering */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <h3 className="font-semibold text-gray-900">No discussions found</h3>
          <p className="mt-1 text-sm text-gray-600">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <PostCard
              key={thread.id}
              thread={thread}
              onThreadClick={onThreadClick}
              onLike={onLike}
              onShare={onShare}
              onMoreOptions={onMoreOptions}
              currentUserId={currentUserId}
              onThreadEditRequest={onThreadEditRequest}
              onThreadDelete={onThreadDelete}
              isCompact={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
