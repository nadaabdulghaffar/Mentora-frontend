/** Matches backend `Mentora.Domain.Enums.CommunityRole`. */
export const CommunityRole = {
  Owner: 1,
  Admin: 2,
  Member: 3,
} as const;

export type CommunityRoleValue =
  (typeof CommunityRole)[keyof typeof CommunityRole];

export type CommunityRoleName =
  | "Owner"
  | "Admin"
  | "Member";

export function communityRoleFromApi(
  role: number | string
): CommunityRoleName {
  if (typeof role === "number") {
    if (role === CommunityRole.Owner) {
      return "Owner";
    }
    if (role === CommunityRole.Admin) {
      return "Admin";
    }
    return "Member";
  }

  const normalized = role.trim();

  if (normalized === "Owner") {
    return "Owner";
  }

  if (normalized === "Admin") {
    return "Admin";
  }

  return "Member";
}

export function communityRoleLabel(
  role: CommunityRoleName
): string {
  return role;
}
