import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Layout from "../shared/components/Layout";
import { exploreCommunities } from "../services/communityService";
import { exploreRoadmaps } from "../services/exploreRoadmapService";
import {
  exploreMentors,
  explorePreview,
  explorePrograms,
  type ExploreAllPreviewDto,
} from "../services/exploreService";
import type { PagedResult } from "../types/api";
import ExploreFilters from "./explore/ExploreFilters";
import ExploreItemGrid from "./explore/ExploreItemGrid";
import ExplorePagination from "./explore/ExplorePagination";
import ExplorePreviewSections from "./explore/ExplorePreviewSections";
import {
  mapExploreCommunitiesToItems,
  mapMentorToExploreItem,
  mapProgramsToExploreItems,
  mapRoadmapsToExploreItems,
  type ExploreCommunityRow,
} from "./explore/exploreMappers";
import {
  applyExploreUrlUpdate,
  buildExploreSearchParams,
  buildPreviewSearchParams,
  DEFAULT_EXPLORE_FILTERS,
  parseExploreTab,
  readFiltersFromSearchParams,
  readPageFromSearchParams,
} from "./explore/exploreUrlState";
import {
  EXPLORE_TAB_ORDER,
  type ExploreFiltersState,
  type ExploreItem,
  type ExploreResourceTab,
  type ExploreTab,
} from "./explore/exploreTypes";
import {
  useEffectRunDiagnostics,
  usePageLifecycleDiagnostics,
  withLoadingDiagnostics,
} from "../utils/pageDiagnosticLogger";

const PAGE_NAME = "ExplorePage";

const TAB_LABELS: Record<ExploreTab, string> = {
  all: "All",
  programs: "Programs",
  mentors: "Mentors",
  roadmaps: "Roadmaps",
  communities: "Communities",
};

const PREVIEW_SECTION_ORDER: {
  key: ExploreResourceTab;
  title: string;
}[] = [
  { key: "programs", title: "Programs" },
  { key: "mentors", title: "Mentors" },
  { key: "roadmaps", title: "Roadmaps" },
  { key: "communities", title: "Communities" },
];

const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  usePageLifecycleDiagnostics(PAGE_NAME);

  const activeTab = useMemo(
    () => parseExploreTab(searchParams.get("tab")),
    [searchParams]
  );
  const filters = useMemo(
    () => readFiltersFromSearchParams(searchParams),
    [searchParams]
  );
  const pageNumber = useMemo(
    () => readPageFromSearchParams(searchParams),
    [searchParams]
  );

  const [query, setQuery] = useState(
    () => searchParams.get("q")?.trim() ?? ""
  );
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const [previewData, setPreviewData] = useState<ExploreAllPreviewDto | null>(
    null
  );
  const [previewSections, setPreviewSections] = useState<
    { key: ExploreResourceTab; title: string; items: ExploreItem[]; totalCount: number }[]
  >([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [tabItems, setTabItems] = useState<ExploreItem[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [pagination, setPagination] = useState<
    Pick<
      PagedResult<unknown>,
      "pageNumber" | "totalPages" | "hasNextPage" | "hasPreviousPage" | "totalCount"
    >
  >({
    pageNumber: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    totalCount: 0,
  });

  useEffect(() => {
    const fromUrl = searchParams.get("q")?.trim() ?? "";
    setQuery((current) => (current === fromUrl ? current : fromUrl));
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fromUrl = searchParams.get("q")?.trim() ?? "";
    if (debouncedQuery === fromUrl) return;
    setSearchParams(
      (prev) =>
        applyExploreUrlUpdate(prev, { q: debouncedQuery, clearPage: true }),
      { replace: true }
    );
  }, [debouncedQuery, searchParams, setSearchParams]);

  const updateUrl = useCallback(
    (
      updates: Parameters<typeof applyExploreUrlUpdate>[1]
    ) => {
      setSearchParams(
        (prev) => applyExploreUrlUpdate(prev, updates),
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleTabChange = (tab: ExploreTab) => {
    console.log(`[${PAGE_NAME}] Refresh trigger — tab change to ${tab}`);
    updateUrl({ tab, clearPage: true });
  };

  const handleFiltersChange = (next: ExploreFiltersState) => {
    console.log(`[${PAGE_NAME}] Refresh trigger — filters change`);
    updateUrl({ filters: next, clearPage: true });
  };

  const handleClearFilters = () => {
    console.log(`[${PAGE_NAME}] Refresh trigger — clear filters`);
    updateUrl({ filters: DEFAULT_EXPLORE_FILTERS, clearPage: true });
    setQuery("");
  };

  const handlePageChange = (page: number) => {
    console.log(`[${PAGE_NAME}] Refresh trigger — page change to ${page}`);
    updateUrl({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewMore = (tab: ExploreResourceTab) => {
    updateUrl({ tab, clearPage: true });
  };

  const handleCommunityMembershipChange = (
    communityId: string,
    isJoined: boolean
  ) => {
    const patch = (items: ExploreItem[]) =>
      items.map((item) =>
        item.tab === "communities" && item.id === communityId
          ? { ...item, isJoined }
          : item
      );

    setTabItems((prev) => patch(prev));
    setPreviewSections((prev) =>
      prev.map((section) =>
        section.key === "communities"
          ? { ...section, items: patch(section.items) }
          : section
      )
    );
  };

  const apiParams = useMemo(
    () => buildExploreSearchParams(debouncedQuery, filters, pageNumber),
    [debouncedQuery, filters, pageNumber]
  );

  const previewParams = useMemo(
    () => buildPreviewSearchParams(debouncedQuery, filters),
    [debouncedQuery, filters]
  );

  useEffectRunDiagnostics(PAGE_NAME, "loadPreview", [activeTab, previewParams]);

  useEffect(() => {
    if (activeTab !== "all") return;

    let mounted = true;

    const loadPreview = async () => {
      setPreviewLoading(true);
      try {
        const data = await withLoadingDiagnostics(
          PAGE_NAME,
          "preview",
          () => explorePreview(previewParams)
        );

        const programItems = await mapProgramsToExploreItems(
          data.programs.items
        );
        const mentorItems = data.mentors.items.map(mapMentorToExploreItem);
        const roadmapItems = await mapRoadmapsToExploreItems(
          data.roadmaps.items
        );
        const communityItems = mapExploreCommunitiesToItems(
          data.communities.items as ExploreCommunityRow[]
        );

        if (!mounted) return;

        setPreviewData(data);
        setPreviewSections([
          {
            key: "programs",
            title: "Programs",
            items: programItems,
            totalCount: data.programs.totalCount,
          },
          {
            key: "mentors",
            title: "Mentors",
            items: mentorItems,
            totalCount: data.mentors.totalCount,
          },
          {
            key: "roadmaps",
            title: "Roadmaps",
            items: roadmapItems,
            totalCount: data.roadmaps.totalCount,
          },
          {
            key: "communities",
            title: "Communities",
            items: communityItems,
            totalCount: data.communities.totalCount,
          },
        ]);
      } catch (err) {
        console.error(`[${PAGE_NAME}] Failed to load explore preview`, err);
        if (mounted) {
          setPreviewData(null);
          setPreviewSections([]);
        }
      } finally {
        if (mounted) setPreviewLoading(false);
      }
    };

    loadPreview();
    return () => {
      mounted = false;
    };
  }, [activeTab, previewParams]);

  useEffectRunDiagnostics(PAGE_NAME, "loadTab", [activeTab, apiParams]);

  useEffect(() => {
    if (activeTab === "all") return;

    let mounted = true;

    const loadTab = async () => {
      setTabLoading(true);
      console.log(`[${PAGE_NAME}] Loading tab=${activeTab}`);
      const tabStart = performance.now();
      try {
        if (activeTab === "mentors") {
          const res = await exploreMentors(apiParams);
          if (!mounted) return;
          setTabItems(res.items.map(mapMentorToExploreItem));
          setPagination({
            pageNumber: res.pageNumber,
            totalPages: res.totalPages,
            hasNextPage: res.hasNextPage,
            hasPreviousPage: res.hasPreviousPage,
            totalCount: res.totalCount,
          });
          return;
        }

        if (activeTab === "programs") {
          const res = await explorePrograms(apiParams);
          if (!mounted) return;
          setTabItems(await mapProgramsToExploreItems(res.items));
          setPagination({
            pageNumber: res.pageNumber,
            totalPages: res.totalPages,
            hasNextPage: res.hasNextPage,
            hasPreviousPage: res.hasPreviousPage,
            totalCount: res.totalCount,
          });
          return;
        }

        if (activeTab === "roadmaps") {
          const res = await exploreRoadmaps(apiParams);
          if (!mounted) return;
          setTabItems(await mapRoadmapsToExploreItems(res.items));
          setPagination({
            pageNumber: res.pageNumber,
            totalPages: res.totalPages,
            hasNextPage: res.hasNextPage,
            hasPreviousPage: res.hasPreviousPage,
            totalCount: res.totalCount,
          });
          return;
        }

        if (activeTab === "communities") {
          const res = await exploreCommunities(apiParams);
          if (!mounted) return;
          setTabItems(
            mapExploreCommunitiesToItems(
              res.items as ExploreCommunityRow[]
            )
          );
          setPagination({
            pageNumber: res.pageNumber,
            totalPages: res.totalPages,
            hasNextPage: res.hasNextPage,
            hasPreviousPage: res.hasPreviousPage,
            totalCount: res.totalCount,
          });
        }
      } catch (err) {
        console.error(`[${PAGE_NAME}] Failed to load explore ${activeTab}`, err);
        if (mounted) {
          setTabItems([]);
          setPagination({
            pageNumber: 1,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            totalCount: 0,
          });
        }
      } finally {
        if (mounted) {
          console.log(
            `[${PAGE_NAME}] Tab ${activeTab} loaded in ${Math.round(performance.now() - tabStart)}ms`
          );
          setTabLoading(false);
        }
      }
    };

    loadTab();
    return () => {
      mounted = false;
    };
  }, [activeTab, apiParams]);

  const orderedPreviewSections = useMemo(() => {
    if (previewSections.length > 0) return previewSections;
    return PREVIEW_SECTION_ORDER.map((s) => ({
      ...s,
      items: [] as ExploreItem[],
      totalCount: previewData?.[s.key]?.totalCount ?? 0,
    }));
  }, [previewSections, previewData]);

  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">
            Find your expert guide.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">
            Connect with top mentors and exclusive programs tailored for
            today&apos;s creators.
          </p>
        </div>

        <form
          className="mx-auto mt-7 flex w-full max-w-3xl items-center rounded-2xl border border-[#E2E5EE] bg-white px-4 py-2 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            setDebouncedQuery(query.trim());
          }}
        >
          <Search size={18} className="text-[#A3A9B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mentors, topics, or resources..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#2D3344] outline-none placeholder:text-[#B6BDCC]"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Explore
          </button>
        </form>

        <div className="mt-6 flex justify-center px-4">
          <div
            className="inline-flex max-w-full flex-wrap justify-center rounded-xl bg-[#ECEEF3] p-1"
            role="tablist"
            aria-label="Explore categories"
          >
            {EXPLORE_TAB_ORDER.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => handleTabChange(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition md:px-5 ${
                  activeTab === tab
                    ? "bg-white text-[#202637] shadow-sm"
                    : "text-[#6A7288]"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <ExploreFilters
            activeTab={activeTab}
            filters={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
          />

          <div className="min-w-0">
            {activeTab === "all" ? (
              <ExplorePreviewSections
                sections={orderedPreviewSections}
                loading={previewLoading}
                onViewMore={handleViewMore}
                onCommunityMembershipChange={
                  handleCommunityMembershipChange
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <ExploreItemGrid
                    items={tabItems}
                    loading={tabLoading}
                    onCommunityMembershipChange={
                      handleCommunityMembershipChange
                    }
                  />
                </div>

                <ExplorePagination
                  pageNumber={pagination.pageNumber}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExplorePage;
