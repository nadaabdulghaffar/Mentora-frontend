
import type { Community } from "../types";

import { getDomainName } from "../../../utils/domainCache";
import {
  getProfileAvatarFallback,
  resolveProfilePictureUrl,
} from "../../../utils/profileImageUrl";
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
    createdByUserProfilePicture?: string;
    isMember?: boolean;
    currentUserRole?: string;
    canManage?: boolean;
  }
): Community => {
  return {
    id: data.communityId,

    name: data.name,

    description:
      data.description || "",

    avatar:
      resolveProfilePictureUrl(
        data.createdByUserProfilePicture
      ) ||
      getProfileAvatarFallback(data.name),

    cover:
      resolveCommunityImageUrl(
        data.coverImageUrl
      ),

    domain:
      getDomainName(data.domainId),

    domainId:
      data.domainId,

    memberCount:
      data.membersCount || 0,

    isPublic: true,

    createdDate:
      data.createdAt,

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
