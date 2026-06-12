import React from 'react';
import { Lightbulb } from 'lucide-react';
import { ProfileAvatar } from './profile/ProfileAvatar';
import type { ExplanationMetadataDto } from '../services/chatService';

export interface MentorRecommendationCardProps {
  id: string;
  name: string;
  domain: string | null;
  imageUrl: string | null;
  matchPercentage: number;
  matchReason?: string | null;
  matchReasons?: string[] | null;
  explanationMetadata?: ExplanationMetadataDto | null;
  onSeeProfileClick: () => void;
  className?: string;
}

export const MentorRecommendationCard: React.FC<MentorRecommendationCardProps> = ({
  name,
  domain,
  imageUrl,
  matchPercentage,
  matchReason,
  matchReasons,
  explanationMetadata,
  onSeeProfileClick,
  className = '',
}) => {
  const getCompatibilityColor = (band: string) => {
    switch(band) {
      case 'exact_fit': return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
      case 'near_fit': return 'bg-blue-100 text-blue-700 ring-blue-500/20';
      case 'stretch_fit': return 'bg-amber-100 text-amber-700 ring-amber-500/20';
      case 'weak_fit': return 'bg-slate-100 text-slate-700 ring-slate-500/20';
      default: return 'bg-green-50 text-green-600 ring-green-500/20';
    }
  };

  const getCompatibilityText = (band: string) => {
    switch(band) {
      case 'exact_fit': return 'Exact Fit';
      case 'near_fit': return 'Strong Fit';
      case 'stretch_fit': return 'Stretch Fit';
      case 'weak_fit': return 'Exploratory';
      default: return 'Good Match';
    }
  };
  return (
    <div className={`group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-primary/20 ${className}`}>
      {/* Top Background Pattern (Shared visual language with ExploreMentorCard) */}
      <div className="relative h-28 w-full bg-[#E5E0F8] overflow-hidden">
        {/* Wavy bottom shape */}
        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 left-0 w-full h-12 object-cover translate-y-[2px]" 
          preserveAspectRatio="none"
        >
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,192C1120,181,1280,139,1360,117.3L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Avatar Section */}
      <div className="relative flex justify-center -mt-14 px-4">
        <div className="relative inline-block shrink-0">
          <ProfileAvatar 
            pictureUrl={imageUrl} 
            name={name} 
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
          />
          <span className="absolute bottom-1 right-1 h-4 w-4 bg-[#22C55E] border-2 border-white rounded-full"></span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col items-center px-4 pt-4 pb-5 text-center">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {domain && (
            <span className="inline-flex items-center rounded-full bg-[#F3E8FF] px-3 py-1 text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider">
              {domain}
            </span>
          )}
          {explanationMetadata?.compatibility_fit_band ? (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${getCompatibilityColor(explanationMetadata.compatibility_fit_band)}`}>
              {getCompatibilityText(explanationMetadata.compatibility_fit_band)}
            </span>
          ) : matchPercentage !== undefined ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-600 uppercase tracking-wider ring-1 ring-inset ring-green-500/20">
              {matchPercentage}% Match
            </span>
          ) : null}
        </div>
        
        {/* Name */}
        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2">
          {name}
        </h3>
        
        {/* AI Insights & Match Reasons */}
        {explanationMetadata ? (
          <div className="mt-2 mb-4 w-full flex flex-col items-start text-left px-3 py-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 w-full">
              <div className="shrink-0 rounded-full bg-[#F3E8FF] p-1 text-[#8B5CF6]">
                <Lightbulb size={12} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Why this mentor?
              </span>
            </div>
            
            <ul className="text-[11px] font-medium text-slate-600 leading-snug space-y-1.5">
              {explanationMetadata.matched_skills && explanationMetadata.matched_skills.length > 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="text-[#8B5CF6] shrink-0 mt-[1px] leading-tight text-[14px]">•</span>
                  <span><strong>Skills:</strong> {explanationMetadata.matched_skills.slice(0, 3).join(', ')}</span>
                </li>
              )}
              {explanationMetadata.target_level_gap !== undefined && explanationMetadata.target_level_gap < 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-500 shrink-0 mt-[1px] leading-tight text-[14px]">•</span>
                  <span className="text-amber-600">Stretch goal: Requires higher level</span>
                </li>
              )}
              {explanationMetadata.reason && (
                <li className="flex items-start gap-1.5 mt-1.5 pt-1.5 border-t border-slate-200/60">
                  <span className="text-[#8B5CF6] shrink-0 mt-[1px] leading-tight text-[14px]">•</span>
                  <span className="line-clamp-2">{explanationMetadata.reason.replace(/^•\s*/, '')}</span>
                </li>
              )}
            </ul>
          </div>
        ) : (matchReasons?.length || matchReason) ? (
          <div className="mt-2 mb-4 w-full flex flex-col items-start text-left px-3 py-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 w-full">
              <div className="shrink-0 rounded-full bg-[#F3E8FF] p-1 text-[#8B5CF6]">
                <Lightbulb size={12} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Highly rated
              </span>
            </div>
            
            <ul className="text-[11px] font-medium text-slate-600 leading-snug space-y-1.5">
              {matchReasons && matchReasons.length > 0 ? (
                matchReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#8B5CF6] shrink-0 mt-[1px] leading-tight text-[14px]">•</span>
                    <span className="line-clamp-2">{reason.replace(/^•\s*/, '')}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-1.5">
                  <span className="text-[#8B5CF6] shrink-0 mt-[1px] leading-tight text-[14px]">•</span>
                  <span className="line-clamp-2">{matchReason?.replace(/^•\s*/, '')}</span>
                </li>
              )}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto pt-2 w-full">
          <button 
            onClick={onSeeProfileClick}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            See Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorRecommendationCard;
