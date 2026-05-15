/**
 * CommunityFeed Section Component
 * Displays the main discussion feed with threads
 */

import React, { useState } from 'react';
import { Image, Video, FileText, Send } from 'lucide-react';
import { PostCard } from '../../../components/community/PostCard';
import { CommunityThread } from '../types';

interface CommunityFeedSectionProps {
  threads: CommunityThread[];
  isLoading?: boolean;
  onThreadClick: (thread: CommunityThread) => void;
  onLike: (threadId: string) => void;
  onSave: (threadId: string) => void;
  onShare: (threadId: string) => void;
  onMoreOptions?: (threadId: string) => void;
  onCreatePost?: () => void;
  currentUserId?: string;
  onThreadEditRequest?: (thread: CommunityThread) => void;
  onThreadDelete?: (threadId: string) => void;
}

/**
 * CommunityFeedSection - Main feed display with threads
 * Features:
 * - Dynamic thread rendering with mapping
 * - Search functionality
 * - Sort options (recent, popular, trending)
 * - Category filtering
 * - Loading states
 * - Empty state handling
 * - Responsive grid layout
 */
export const CommunityFeedSection: React.FC<CommunityFeedSectionProps> = ({
  threads,
  isLoading,
  onThreadClick,
  onLike,
  onSave,
  onShare,
  onMoreOptions,
  onCreatePost,
  currentUserId,
  onThreadEditRequest,
  onThreadDelete,
}) => {
  const [draft, setDraft] = useState('');

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
            alt="You"
            className="h-9 w-9 rounded-full"
          />
          <input
            type="text"
            placeholder="Share something with this community..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-xl bg-pane px-4 py-2.5 text-sm outline-none"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <button className="inline-flex items-center gap-1 hover:text-gray-700"><Image size={14} />Photo</button>
            <button className="inline-flex items-center gap-1 hover:text-gray-700"><Video size={14} />Video</button>
            <button className="inline-flex items-center gap-1 hover:text-gray-700"><FileText size={14} />Application</button>
          </div>
          <button
            onClick={onCreatePost}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
          >
            <Send size={14} />
            Post
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
              onSave={onSave}
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
