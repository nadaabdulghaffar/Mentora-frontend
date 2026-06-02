/**
 * useCommunityMembers Hook
 * Loads owners, admins, and members from backend endpoints.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CommunityMember } from "../types";
import {
  getCommunityAdmins,
  getCommunityMembers,
  getCommunityOwners,
} from "../../../services/communityService";
import {
  mapApiMembersToCommunityMembers,
} from "../utils/memberMapper";

export function useCommunityMembers(
  communityId?: string
) {
  const [owners, setOwners] = useState<
    CommunityMember[]
  >([]);
  const [admins, setAdmins] = useState<
    CommunityMember[]
  >([]);
  const [members, setMembers] = useState<
    CommunityMember[]
  >([]);
  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  const refreshMembers =
    useCallback(async () => {
      if (!communityId) {
        setOwners([]);
        setAdmins([]);
        setMembers([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [
          ownersResponse,
          adminsResponse,
          membersResponse,
        ] = await Promise.all([
          getCommunityOwners(
            communityId
          ),
          getCommunityAdmins(
            communityId
          ),
          getCommunityMembers(
            communityId
          ),
        ]);

        setOwners(
          mapApiMembersToCommunityMembers(
            ownersResponse
          )
        );
        setAdmins(
          mapApiMembersToCommunityMembers(
            adminsResponse
          )
        );
        setMembers(
          mapApiMembersToCommunityMembers(
            membersResponse
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load members"
        );
      } finally {
        setIsLoading(false);
      }
    }, [communityId]);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  const totalCount = useMemo(
    () =>
      owners.length +
      admins.length +
      members.length,
    [
      owners.length,
      admins.length,
      members.length,
    ]
  );

  return {
    owners,
    admins,
    members,
    totalCount,
    isLoading,
    error,
    refreshMembers,
  };
}
