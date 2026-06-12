import type { CommunityMember } from "../types";
import { communityRoleFromApi } from "../../../constants/communityRoles";
import { resolveProfilePictureUrl } from "../../../utils/profileImageUrl";

export interface ApiMemberResponse {
  userId: string;
  userName: string;
  profilePictureUrl?: string;
  role: number | string;
  joinedAt: string;
}

export function mapApiMemberToCommunityMember(
  member: ApiMemberResponse
): CommunityMember {
  return {
    id: member.userId,
    name: member.userName,
    avatar: resolveProfilePictureUrl(member.profilePictureUrl) || "",
    role: communityRoleFromApi(member.role),
    joinedDate: new Date(member.joinedAt).toLocaleDateString(),
    bio: "",
  };
}

export function mapApiMembersToCommunityMembers(
  members: ApiMemberResponse[]
): CommunityMember[] {
  return members.map(mapApiMemberToCommunityMember);
}
