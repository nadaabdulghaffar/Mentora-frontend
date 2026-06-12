
import type { Community } from "../types";

import { getDomainName } from "../../../utils/domainCache";
import { resolveCommunityImageUrl } from "../../../utils/communityImageUrl";

export const mapCommunityResponse = (
  data: {
    communityId: string;
    name: string;
    description?: string;
    coverImageUrl?: string;
    domainId: number;
    membersCount?: number;
    createdAt: string;
    createdByUserName?: string;
    createdByUserProfilePicture?: string;
    isMember?: boolean;
    currentUserRole?: string;
    canManage?: boolean;
  }
): Community => {
  const cover = resolveCommunityImageUrl(data.coverImageUrl);

  return {
    id: data.communityId,

    name: data.name,

    description:
      data.description || "",

    avatar: cover,

    cover,

    domain:
      getDomainName(data.domainId),

    domainId:
      data.domainId,

    memberCount:
      data.membersCount || 0,

    isPublic: true,

    createdDate:
      data.createdAt,

    creatorName:
      data.createdByUserName,

    creatorAvatar:
      data.createdByUserProfilePicture,

    isJoined:
      data.isMember,

    currentUserRole:
      data.currentUserRole,

    canManage:
      data.canManage,
  };
};

export const mapCommunitiesResponse = (
  communities: Array<Parameters<typeof mapCommunityResponse>[0]>
): Community[] => {
  return communities.map(
    mapCommunityResponse
  );
};
