import type { ExploreFiltersState, ExploreTab } from "./exploreTypes";
import { DEFAULT_EXPLORE_FILTERS, EXPLORE_TAB_ORDER } from "./exploreTypes";
import type { ExploreSearchParams } from "../../types/api";

const TAB_SET = new Set<string>(EXPLORE_TAB_ORDER);

export function parseExploreTab(value: string | null): ExploreTab {
  if (value && TAB_SET.has(value)) return value as ExploreTab;
  return "all";
}

function parseOptionalInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseOptionalBool(value: string | null): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function readFiltersFromSearchParams(
  params: URLSearchParams
): ExploreFiltersState {
  const openedNow = parseOptionalBool(params.get("openedNow"));
  return {
    domainId: parseOptionalInt(params.get("domainId")),
    subDomainId: parseOptionalInt(params.get("subDomainId")),
    openedNow: openedNow === true ? true : null,
    targetLevel: parseOptionalInt(params.get("targetLevel")),
    educationLevel: parseOptionalInt(params.get("educationLevel")),
  };
}

export function buildExploreSearchParams(
  searchQuery: string,
  filters: ExploreFiltersState,
  pageNumber: number,
  pageSize = 6
): ExploreSearchParams {
  const params: ExploreSearchParams = {
    pageNumber,
    pageSize,
  };

  const q = searchQuery.trim();
  if (q) params.searchQuery = q;

  if (filters.domainId != null) params.domainId = filters.domainId;
  if (filters.subDomainId != null) params.subDomainId = filters.subDomainId;

  if (filters.openedNow === true) params.openedNow = true;
  if (filters.targetLevel != null) params.targetLevel = filters.targetLevel;
  if (filters.educationLevel != null)
    params.educationLevel = filters.educationLevel;

  return params;
}

export function buildPreviewSearchParams(
  searchQuery: string,
  filters: ExploreFiltersState
): Omit<ExploreSearchParams, "pageNumber" | "pageSize"> {
  const { pageNumber: _p, pageSize: _s, ...rest } = buildExploreSearchParams(
    searchQuery,
    filters,
    1
  );
  return rest;
}

export function applyExploreUrlUpdate(
  prev: URLSearchParams,
  updates: {
    tab?: ExploreTab;
    q?: string;
    page?: number;
    filters?: ExploreFiltersState;
    clearPage?: boolean;
  }
): URLSearchParams {
  const next = new URLSearchParams(prev);

  if (updates.tab != null) next.set("tab", updates.tab);

  if (updates.q !== undefined) {
    const trimmed = updates.q.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
  }

  if (updates.filters) {
    const f = updates.filters;
    if (f.domainId != null) next.set("domainId", String(f.domainId));
    else next.delete("domainId");

    if (f.subDomainId != null) next.set("subDomainId", String(f.subDomainId));
    else next.delete("subDomainId");



    if (f.openedNow === true) next.set("openedNow", "true");
    else next.delete("openedNow");

    if (f.targetLevel != null) next.set("targetLevel", String(f.targetLevel));
    else next.delete("targetLevel");

    if (f.educationLevel != null)
      next.set("educationLevel", String(f.educationLevel));
    else next.delete("educationLevel");
  }

  if (updates.clearPage) next.delete("page");

  if (updates.page != null && updates.page > 1) {
    next.set("page", String(updates.page));
  } else if (updates.page === 1 || updates.clearPage) {
    next.delete("page");
  }

  return next;
}

export function readPageFromSearchParams(params: URLSearchParams): number {
  const page = parseOptionalInt(params.get("page"));
  return page ?? 1;
}

export { DEFAULT_EXPLORE_FILTERS };
