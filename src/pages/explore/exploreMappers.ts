import type {
  MentorExploreDto,
  ProgramExploreDto,
} from "../../services/exploreService";
import type { RoadmapExploreDto } from "../../services/exploreRoadmapService";
import { getProgramView } from "../../services/programService";
import { getRoadmapView } from "../../services/roadmapService";
import { resolveCommunityImageUrl } from "../../utils/communityImageUrl";
import {
  exploreRoadmapToListItem,
  formatRoadmapDuration,
  loadRoadmapDomainNameMaps,
  type DomainNameMaps,
} from "../../utils/roadmapDisplayUtils";
import { ensureDomainsLoaded, getDomainName } from "../../utils/domainCache";
import type { ExploreItem } from "./exploreTypes";
import { resolveAuthorAvatar } from "../community/utils/authorAvatar";

const apiRoot = () =>
  (import.meta.env.VITE_API_URL ?? "http://localhost:5069/api").replace(
    /\/api\/?$/,
    ""
  );

export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${apiRoot()}${url.startsWith("/") ? url : `/${url}`}`;
}

export function mapMentorToExploreItem(m: MentorExploreDto): ExploreItem {
  return {
    id: String(m.mentorId),
    tab: "mentors",
    title: m.fullName,
    description: m.bio ?? "",
    image: resolveMediaUrl(m.profileImageUrl),
    tag: m.domainName?.toUpperCase?.() ?? "MENTOR",
    phases: m.rating ? `${Number(m.rating).toFixed(1)} ★` : undefined,
  };
}

export async function mapProgramToExploreItem(
  p: ProgramExploreDto
): Promise<ExploreItem> {
  const defaultImage =
    "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80";

  let isApplied = false;
  try {
    const view = await getProgramView(p.id);
    isApplied = Boolean(view.isApplied);
  } catch {
    // per-item enrichment optional
  }

  const mentorAvatar = resolveMediaUrl(p.mentorProfileImageUrl);

  return {
    id: String(p.id),
    tab: "programs",
    title: p.title,
    description: p.description,
    image: defaultImage,
    tag: p.domainName?.toUpperCase?.() ?? "PROGRAM",
    phases: p.subDomainName
      ? p.subDomainName.toUpperCase()
      : p.mentorName,
    isApplied,
    author: {
      avatar:
        mentorAvatar ??
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(p.mentorName)}`,
      name: p.mentorName,
    },
  };
}

export async function mapProgramsToExploreItems(
  programs: ProgramExploreDto[]
): Promise<ExploreItem[]> {
  return Promise.all(programs.map(mapProgramToExploreItem));
}

export async function mapRoadmapToExploreItem(
  r: RoadmapExploreDto,
  maps: DomainNameMaps
): Promise<ExploreItem> {
  let mentorName = "";
  let mentorAvatar: string | undefined;

  try {
    const view = await getRoadmapView(r.roadmapId);
    mentorName = view?.mentorName ?? "";
    mentorAvatar = resolveMediaUrl(view?.profilePictureUrl);
  } catch {
    // optional enrichment
  }

  const listItem = exploreRoadmapToListItem(r, maps);

  return {
    id: String(r.roadmapId),
    tab: "roadmaps",
    title: r.title,
    description: r.description,
    image: mentorAvatar,
    tag: listItem.domainName,
    phases: listItem.subDomainName,
    durationBadge: formatRoadmapDuration(listItem.duration),
    author: {
      avatar:
        mentorAvatar ??
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(mentorName || r.title)}`,
      name: mentorName || "Unknown",
    },
  };
}

export async function mapRoadmapsToExploreItems(
  roadmaps: RoadmapExploreDto[]
): Promise<ExploreItem[]> {
  const maps = await loadRoadmapDomainNameMaps();
  return Promise.all(roadmaps.map((r) => mapRoadmapToExploreItem(r, maps)));
}

export type ExploreCommunityRow = {
  communityId: string;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  domainId: number;
  membersCount?: number;
  postsCount?: number;
  creatorName?: string;
  isMember?: boolean;
};

export function mapExploreCommunityToItem(c: ExploreCommunityRow): ExploreItem {
  const cover = resolveCommunityImageUrl(c.coverImageUrl);
  const authorName = c.creatorName ?? "Community";
  const domainName = getDomainName(c.domainId);
  return {
    id: c.communityId,
    tab: "communities",
    title: c.name,
    description: c.description ?? "",
    image: cover,
    tag: domainName.toUpperCase(),
    phases: `${(c.membersCount ?? 0).toLocaleString()} MEMBERS`,
    isJoined: c.isMember,
    author: {
      avatar: resolveAuthorAvatar(authorName),
      name: authorName,
    },
  };
}

export async function mapExploreCommunitiesToItems(
  items: ExploreCommunityRow[]
): Promise<ExploreItem[]> {
  await ensureDomainsLoaded();
  return items.map(mapExploreCommunityToItem);
}
