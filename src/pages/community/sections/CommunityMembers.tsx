/**
 * CommunityMembers Section Component
 * Displays community members with filtering and management
 */

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { MemberCard } from '../../../components/community/MemberCard';
import type { CommunityMember } from '../types';

interface CommunityMembersSectionProps {
  members: CommunityMember[];
  staffMembers: CommunityMember[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFollowMember: (memberId: string) => void;
  onUnfollowMember: (memberId: string) => void;
  onMessageMember: (memberId: string) => void;
  // Admin actions
  currentUserId?: string;
  onRemoveMember?: (memberId: string) => void;
  onBanMember?: (memberId: string) => void;
  onChangeMemberRole?: (memberId: string, newRole: 'Owner' | 'Admin' | 'member') => void;
  isLoading?: boolean;
}

/**
 * CommunityMembersSection - Displays and manages community members
 * Features:
 * - Dynamic member rendering
 * - Search functionality
 * - Admin section for member requests
 * - Staff members display
 * - Regular members grid
 * - Member interaction buttons
 * - Responsive layout
 */
export const CommunityMembersSection: React.FC<CommunityMembersSectionProps> = ({
  members,
  staffMembers,
  searchQuery,
  onSearchChange,
  onFollowMember,
  onUnfollowMember,
  onMessageMember,
  onRemoveMember,
  onBanMember,
  onChangeMemberRole,
  isLoading,
}) => {
  const [isAllMembersOpen, setIsAllMembersOpen] = useState(false);
  const regularMembers = members.filter((m) => m.role === 'member');
  const previewMembers = regularMembers.slice(0, 3);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Members ({members.length} members)</h2>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-400"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {staffMembers.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Admins & Moderators</h3>
              <div className="space-y-3">
                {staffMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onFollow={onFollowMember}
                    onUnfollow={onUnfollowMember}
                    onMessage={onMessageMember}
                    onRemove={onRemoveMember}
                    onBan={onBanMember}
                    onChangeRole={onChangeMemberRole}
                    showFollowButton={false}
                    showMessageButton={true}
                    isCompact
                  />
                ))}
              </div>
            </div>
          )}

          {regularMembers.length > 0 && (
            <div>
              <div className="mb-3 mt-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Community Members</h3>
                <button
                  onClick={() => setIsAllMembersOpen(true)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  See all
                </button>
              </div>
              <div className="space-y-3">
                {previewMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onFollow={onFollowMember}
                    onUnfollow={onUnfollowMember}
                    onMessage={onMessageMember}
                    onRemove={onRemoveMember}
                    onBan={onBanMember}
                    onChangeRole={onChangeMemberRole}
                    showFollowButton={false}
                    showMessageButton={true}
                    isCompact
                  />
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-12 text-center">
              <p className="text-sm text-gray-600">No members found</p>
            </div>
          )}

          {isAllMembersOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setIsAllMembersOpen(false)}
            >
              <div
                className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Community Members ({regularMembers.length})
                  </h3>
                  <button
                    onClick={() => setIsAllMembersOpen(false)}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                    aria-label="Close members modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-3 pr-1">
                  {regularMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onFollow={onFollowMember}
                      onUnfollow={onUnfollowMember}
                      onMessage={onMessageMember}
                      onRemove={onRemoveMember}
                      onBan={onBanMember}
                      onChangeRole={onChangeMemberRole}
                      showFollowButton={false}
                      showMessageButton={true}
                      isCompact
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
