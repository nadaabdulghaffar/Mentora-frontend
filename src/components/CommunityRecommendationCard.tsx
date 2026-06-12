import React from 'react';
import { Lightbulb } from 'lucide-react';

export interface CommunityRecommendationCardProps {
  id: string;
  name: string;
  domain: string | null;
  imageUrl?: string | null;
  matchPercentage?: number;
  matchReasons?: string[] | null;
  onExploreClick: () => void;
  className?: string;
}

export const CommunityRecommendationCard: React.FC<CommunityRecommendationCardProps> = ({
  name,
  domain,
  imageUrl,
  matchPercentage,
  matchReasons,
  onExploreClick,
  className = '',
}) => {
  // Parse reasons handling the bullet points format from backend
  const reasonsList = matchReasons?.flatMap(r => 
    r.split('•').map(s => s.trim()).filter(s => s.length > 0)
  );

  return (
    <div className={`group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-primary/20 ${className}`}>
      {/* Content Section */}
      <div className="flex flex-1 flex-col items-center px-4 pt-6 pb-5 text-center">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {domain && (
            <span className="inline-flex items-center rounded-full bg-[#F3E8FF] px-3 py-1 text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider">
              {domain}
            </span>
          )}
          {matchPercentage !== undefined ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-600 uppercase tracking-wider ring-1 ring-inset ring-green-500/20">
              {matchPercentage}% Match
            </span>
          ) : null}
        </div>
        
        {/* Name */}
        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2">
          {name}
        </h3>
        
        {/* AI Insights & Match Reasons */}
        {reasonsList && reasonsList.length > 0 && (
          <div className="mt-2 mb-4 w-full flex flex-col items-start text-left px-3 py-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 w-full">
              <div className="shrink-0 rounded-full bg-[#F3E8FF] p-1 text-[#8B5CF6]">
                <Lightbulb size={12} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Why this community?
              </span>
            </div>
            
            <ul className="text-[11px] font-medium text-slate-600 leading-snug space-y-1.5">
              {reasonsList.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#8B5CF6] shrink-0 mt-[1px] leading-tight text-[14px]">•</span>
                  <span className="line-clamp-2">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-2 w-full">
          <button 
            onClick={onExploreClick}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Explore Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityRecommendationCard;
