import type { ExploreItem, ExploreResourceTab } from "./exploreTypes";
import { EXPLORE_PREVIEW_MAX_ITEMS } from "./exploreTypes";
import ExploreItemGrid from "./ExploreItemGrid";

type SectionConfig = {
  key: ExploreResourceTab;
  title: string;
  items: ExploreItem[];
  totalCount: number;
};

type Props = {
  sections: SectionConfig[];
  loading: boolean;
  onViewMore: (tab: ExploreResourceTab) => void;
  onCommunityMembershipChange?: (
    communityId: string,
    isJoined: boolean
  ) => void;
};

export default function ExplorePreviewSections({
  sections,
  loading,
  onViewMore,
  onCommunityMembershipChange,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.key} aria-labelledby={`explore-${section.key}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id={`explore-${section.key}`}
                className="text-xl font-semibold text-[#202637]"
              >
                {section.title}
              </h2>
              {section.totalCount > 0 && (
                <p className="mt-1 text-sm text-[#6D7386]">
                  {section.totalCount.toLocaleString()} total
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onViewMore(section.key)}
              className="text-sm font-semibold text-primary hover:text-primary-dark"
            >
              View More →
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
            <ExploreItemGrid
              items={section.items.slice(0, EXPLORE_PREVIEW_MAX_ITEMS)}
              onCommunityMembershipChange={onCommunityMembershipChange}
            />
          </div>

          {section.items.length === 0 && !loading && (
            <p className="text-sm text-[#6F778E]">Nothing to preview yet.</p>
          )}
        </section>
      ))}
    </div>
  );
}
