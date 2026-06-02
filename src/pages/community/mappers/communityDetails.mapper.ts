
import type { Community } from "../types";

import type {
  CommunityResponse,
} from "../../../services/communityService";

import { getDomainName } from "../../../utils/domainCache";
import {
  getProfileAvatarFallback,
  resolveProfilePictureUrl,
} from "../../../utils/profileImageUrl";
import { resolveCommunityImageUrl } from "../../../utils/communityImageUrl";

export const mapCommunityDetails =
  (
    community: CommunityResponse
  ): Community => {
    return {
      id:
        community.communityId,

      name:
        community.name,

      description:
        community.description ||
        "",

      avatar:
        resolveProfilePictureUrl(
          community.createdByUserProfilePicture
        ) ||
        getProfileAvatarFallback(
          community.name
        ),

      cover:
        resolveCommunityImageUrl(
          community.coverImageUrl
        ),

      domain:
        getDomainName(
          community.domainId
        ),

      domainId:
        community.domainId,

      memberCount:
        community.membersCount,

      isPublic: true,

      createdDate:
        new Date(
          community.createdAt
        ).toLocaleDateString(),

      isJoined:
        community.isMember,

      currentUserRole:
        community.currentUserRole,

      canManage:
        community.canManage,
    };
  };
