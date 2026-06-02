/**
 * CommunityMembers Section Component
 * Displays community members grouped by backend role
 */

import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { MemberCard } from '../../../components/community/MemberCard';
import type { CommunityMember } from '../types';
import type { CommunityRoleName } from '../../../constants/communityRoles';

interface CommunityMembersSectionProps {
  owners: CommunityMember[];
  admins: CommunityMember[];
  members: CommunityMember[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMessageMember: (memberId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onBanMember?: (memberId: string) => void;
  onChangeMemberRole?: (
    memberId: string,
    newRole: Extract<CommunityRoleName, 'Admin' | 'Member'>
  ) => void;
  canChangeRoles?: boolean;
  canModerate?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

function filterMembers(
  list: CommunityMember[],
  query: string
): CommunityMember[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return list;
  }

  return list.filter((member) =>
    member.name.toLowerCase().includes(normalized)
  );
}

function MemberSection({
  title,
  members,
  emptyMessage,
  onMessageMember,
  onRemoveMember,
  onBanMember,
  onChangeMemberRole,
  canChangeRoles,
  canModerate,
}: {
  title: string;
  members: CommunityMember[];
  emptyMessage: string;
  onMessageMember: (memberId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onBanMember?: (memberId: string) => void;
  onChangeMemberRole?: (
    memberId: string,
    newRole: Extract<CommunityRoleName, 'Admin' | 'Member'>
  ) => void;
  canChangeRoles?: boolean;
  canModerate?: boolean;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        {title} ({members.length})
      </h3>

      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onMessage={onMessageMember}
              onRemove={onRemoveMember}
              onBan={onBanMember}
              onChangeRole={onChangeMemberRole}
              canChangeRoles={canChangeRoles}
              canModerate={canModerate}
              showMessageButton
              isCompact
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  );
}

export const CommunityMembersSection: React.FC<
  CommunityMembersSectionProps
> = ({
  owners,
  admins,
  members,
  totalCount,
  searchQuery,
  onSearchChange,
  onMessageMember,
  onRemoveMember,
  onBanMember,
  onChangeMemberRole,
  canChangeRoles = false,
  canModerate = false,
  isLoading = false,
  error = null,
}) => {
  const filteredOwners = useMemo(
    () => filterMembers(owners, searchQuery),
    [owners, searchQuery]
  );
  const filteredAdmins = useMemo(
    () => filterMembers(admins, searchQuery),
    [admins, searchQuery]
  );
  const filteredMembers = useMemo(
    () => filterMembers(members, searchQuery),
    [members, searchQuery]
  );

  const visibleCount =
    filteredOwners.length +
    filteredAdmins.length +
    filteredMembers.length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">
        Members ({totalCount})
      </h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-400"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : visibleCount === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <p className="text-sm text-gray-600">
            {searchQuery.trim()
              ? 'No members match your search.'
              : 'No members found in this community yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <MemberSection
            title="Owners"
            members={filteredOwners}
            emptyMessage="No owners found."
            onMessageMember={onMessageMember}
          />

          <MemberSection
            title="Admins"
            members={filteredAdmins}
            emptyMessage="No admins found."
            onMessageMember={onMessageMember}
            onRemoveMember={onRemoveMember}
            onBanMember={onBanMember}
            onChangeMemberRole={onChangeMemberRole}
            canChangeRoles={canChangeRoles}
            canModerate={canModerate}
          />

          <MemberSection
            title="Members"
            members={filteredMembers}
            emptyMessage="No members found."
            onMessageMember={onMessageMember}
            onRemoveMember={onRemoveMember}
            onBanMember={onBanMember}
            onChangeMemberRole={onChangeMemberRole}
            canChangeRoles={canChangeRoles}
            canModerate={canModerate}
          />
        </div>
      )}
    </div>
  );
};
