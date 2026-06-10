export type ExploreTab =
  | "all"
  | "programs"
  | "mentors"
  | "roadmaps"
  | "communities";

/** Max cards per section on the All tab preview only (not tab pagination). */
export const EXPLORE_PREVIEW_MAX_ITEMS = 3;

export const EXPLORE_TAB_ORDER: ExploreTab[] = [
  "all",
  "programs",
  "mentors",
  "roadmaps",
  "communities",
];

export const EXPLORE_RESOURCE_TABS = [
  "programs",
  "mentors",
  "roadmaps",
  "communities",
] as const;

export type ExploreResourceTab = (typeof EXPLORE_RESOURCE_TABS)[number];

export interface ExploreItem {
  id: string;
  tab: ExploreResourceTab;
  title: string;
  description: string;
  image?: string;
  tag?: string;
  phases?: string;
  durationBadge?: string;
  isJoined?: boolean;
  isApplied?: boolean;
  author?: { avatar: string; name: string };
}

export interface ExploreFiltersState {
  domainId: number | null;
  subDomainId: number | null;

  openedNow: boolean | null;
  targetLevel: number | null;
  educationLevel: number | null;
}

export const DEFAULT_EXPLORE_FILTERS: ExploreFiltersState = {
  domainId: null,
  subDomainId: null,
  openedNow: null,
  targetLevel: null,
  educationLevel: null,
};
