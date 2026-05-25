
import type { Community } from "../types";

export const mapCommunityResponse = (
  data: any
): Community => {
  return {
    id: data.communityId,

    name: data.name,

    description:
      data.description || "",

    avatar:
      data.coverImageUrl ||
      "https://api.dicebear.com/7.x/avataaars/svg?seed=community",

    cover:
      data.coverImageUrl ||
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=300&fit=crop",

    domain:
      String(data.domainId),

    memberCount:
      data.membersCount || 0,

    isPublic: true,

    createdDate:
      data.createdAt,

    isJoined:
      data.isMember,
  };
};

export const mapCommunitiesResponse = (
  communities: any[]
): Community[] => {
  return communities.map(
    mapCommunityResponse
  );
};
