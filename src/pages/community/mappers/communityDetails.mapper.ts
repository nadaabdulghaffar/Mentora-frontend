
import type {
  Community,
} from "../types";

import type {
  CommunityResponse,
} from "../../../services/communityService";

const DOMAIN_NAMES: Record<
  number,
  string
> = {
  1: "Technology",
  2: "Business",
  3: "Design",
  4: "Marketing",
  5: "AI",
};

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
        community.createdByUserProfilePicture ||
        "https://api.dicebear.com/7.x/initials/svg?seed=Community",

      cover:
        community.coverImageUrl ||
        "",

      domain:
        DOMAIN_NAMES[
          community.domainId
        ] || "General",

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
