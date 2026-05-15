/**
 * useCommunity Hook
 * Manages community data, members, and member requests
 */

import { useState, useCallback, useMemo } from 'react';
import { Community, CommunityMember, MemberRequest, CommunitySettings } from '../types';

interface UseCommunityOptions {
  initialCommunity: Community;
  initialMembers: CommunityMember[];
  initialRequests: MemberRequest[];
}

export const useCommunity = ({
  initialCommunity,
  initialMembers,
  initialRequests,
}: UseCommunityOptions) => {
  const [community, setCommunity] = useState<Community>(initialCommunity);
  const [members, setMembers] = useState<CommunityMember[]>(initialMembers);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter((member) =>
      member.name.toLowerCase().includes(query) ||
      member.bio?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Get admins and moderators
  const staffMembers = useMemo(() => {
    return members.filter((m) => m.role === 'admin' || m.role === 'moderator');
  }, [members]);

  // Get regular members
  const regularMembers = useMemo(() => {
    return members.filter((m) => m.role === 'member');
  }, [members]);

  // Update community settings
  const updateCommunitySettings = useCallback((settings: Partial<CommunitySettings>) => {
    setCommunity((prev) => ({
      ...prev,
      ...settings,
    }));
  }, []);

  // Add member
  const addMember = useCallback((member: CommunityMember) => {
    setMembers((prev) => [...prev, member]);
  }, []);

  // Remove member
  const removeMember = useCallback((memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  // Update member role
  const updateMemberRole = useCallback(
    (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    },
    []
  );

  // Get member by ID
  const getMemberById = useCallback(
    (memberId: string): CommunityMember | undefined => {
      return members.find((m) => m.id === memberId);
    },
    [members]
  );

  // Approve member request
  const approveMemberRequest = useCallback((requestId: string) => {
    const request = memberRequests.find((r) => r.id === requestId);
    if (request) {
      const newMember: CommunityMember = {
        id: request.userId,
        name: request.name,
        avatar: request.avatar,
        role: 'member',
        joinedDate: new Date().toLocaleDateString(),
        bio: request.bio,
      };
      addMember(newMember);
      setMemberRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  }, [memberRequests, addMember]);

  // Reject member request
  const rejectMemberRequest = useCallback((requestId: string) => {
    setMemberRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  // Add new member request
  const addMemberRequest = useCallback((request: MemberRequest) => {
    setMemberRequests((prev) => [...prev, request]);
  }, []);

  // Remove request (used by delete/ban actions in request cards)
  const removeMemberRequest = useCallback((requestId: string) => {
    setMemberRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  // Convert a request into a real community member with selected role
  const changeRequestRole = useCallback(
    (requestId: string, newRole: 'admin' | 'member') => {
      const request = memberRequests.find((r) => r.id === requestId);
      if (!request) return;

      const newMember: CommunityMember = {
        id: request.userId,
        name: request.name,
        avatar: request.avatar,
        role: newRole,
        joinedDate: new Date().toLocaleDateString(),
        bio: request.bio,
      };

      setMembers((prev) => {
        const exists = prev.some((m) => m.id === newMember.id);
        if (exists) {
          return prev.map((m) => (m.id === newMember.id ? { ...m, role: newRole } : m));
        }
        return [...prev, newMember];
      });

      setMemberRequests((prev) => prev.filter((r) => r.id !== requestId));
    },
    [memberRequests]
  );

  // Check if user is member
  const isMember = useCallback(
    (userId: string): boolean => {
      return members.some((m) => m.id === userId);
    },
    [members]
  );

  // Check if user is admin or moderator
  const isStaff = useCallback(
    (userId: string): boolean => {
      const member = getMemberById(userId);
      return member?.role === 'admin' || member?.role === 'moderator';
    },
    [getMemberById]
  );

  // Check if user is admin
  const isAdmin = useCallback(
    (userId: string): boolean => {
      const member = getMemberById(userId);
      return member?.role === 'admin';
    },
    [getMemberById]
  );

  return {
    // Community state
    community,
    members: filteredMembers,
    allMembers: members,
    memberRequests,
    staffMembers,
    regularMembers,
    searchQuery,

    // Community operations
    updateCommunitySettings,
    setSearchQuery,

    // Member operations
    addMember,
    removeMember,
    updateMemberRole,
    getMemberById,

    // Member request operations
    approveMemberRequest,
    rejectMemberRequest,
    addMemberRequest,
    removeMemberRequest,
    changeRequestRole,

    // Permission checks
    isMember,
    isStaff,
    isAdmin,
  };
};
