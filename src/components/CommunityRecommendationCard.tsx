import React from 'react';

export interface CommunityRecommendationCardProps {
  id: string;
  name: string;
  domain: string | null;
  onExploreClick: () => void;
  className?: string;
}

export const CommunityRecommendationCard: React.FC<CommunityRecommendationCardProps> = ({
  name,
  domain,
  onExploreClick,
  className = '',
}) => {
  return (
    <article className={`flex flex-col h-full overflow-hidden rounded-2xl border border-[#D8DBE4] bg-white shadow-[0_2px_8px_rgba(22,29,47,0.06)] ${className}`}>

      <div className="flex flex-col flex-1 p-5">
        {domain && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-[#F4F0FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#6B57B5] uppercase">
              {domain}
            </span>
          </div>
        )}
        
        <h3 className="font-bold leading-tight text-[#1F2432] text-[20px] line-clamp-2">
          {name}
        </h3>

        <div className="mt-auto pt-5">
          <button
            className="h-11 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
            onClick={onExploreClick}
            type="button"
          >
            Explore
          </button>
        </div>
      </div>
    </article>
  );
};

export default CommunityRecommendationCard;
