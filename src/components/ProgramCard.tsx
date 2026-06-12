import React from 'react';
import { Lightbulb } from 'lucide-react';
import type { ExplanationMetadataDto } from '../services/chatService';
import { ProfileAvatar } from './profile/ProfileAvatar';

export interface AuthorInfo {
  avatar: string;  
  name: string;
}

export interface ProgramCardProps {
  variant?: 'simple-button' | 'dual-buttons' | 'progress';
  image?: string;
  tag?: string;  
  phases?: string;
  durationBadge?: string;
  title: string;
  description?: string;
  progress?: number;
  author?: AuthorInfo;
  authorText?: string;
  authorIcon?: React.ReactNode;
  hideAuthorAvatar?: boolean;
  hideHeaderImage?: boolean;
  primaryButtonText?: string;
  explanationMetadata?: ExplanationMetadataDto | null;
  matchPercentage?: number;
  matchReasons?: string[] | null;
  onPrimaryClick?: () => void;
  className?: string;
}



export const ProgramCard: React.FC<ProgramCardProps> = ({
  variant = 'simple-button',
  image,
  tag,
  phases,
  durationBadge,
  title,
  description,
  progress,
  author,
  authorText,
  authorIcon,
  hideAuthorAvatar = false,
  hideHeaderImage = false,
  primaryButtonText = 'Apply',
  explanationMetadata,
  matchPercentage,
  matchReasons,
  onPrimaryClick,
  className = '',
}) => {
  const getCompatibilityColor = (band: string) => {
    switch(band) {
      case 'exact_fit': return 'bg-emerald-100 text-emerald-700';
      case 'near_fit': return 'bg-blue-100 text-blue-700';
      case 'stretch_fit': return 'bg-amber-100 text-amber-700';
      case 'weak_fit': return 'bg-slate-100 text-slate-700';
      default: return 'bg-green-50 text-green-600';
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
  const progressValue = Math.max(0, Math.min(100, progress ?? 0));
  const isProgressVariant = variant === 'progress';
  const isSimpleButtonVariant = variant === 'simple-button';
  const shouldShowProgress = progress !== undefined;
  const headlineLarge = variant === 'dual-buttons' || isProgressVariant;

  return (
    <article className={`flex flex-col h-full overflow-hidden rounded-2xl border border-[#D8DBE4] bg-white shadow-[0_2px_8px_rgba(22,29,47,0.06)] ${className}`}>
      <div className={`flex flex-col flex-1 p-5 ${isSimpleButtonVariant ? 'space-y-3' : 'space-y-3'}`}>
        {(tag || phases || durationBadge) && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {tag && (
                <span className="rounded-full bg-[#F4F0FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#6B57B5] uppercase">
                  {tag}
                </span>
              )}
              {phases && (
                <span className="rounded-full bg-[#EAF9F7] px-3 py-1 text-xs font-semibold tracking-wide text-[#2EA594] uppercase">
                  {phases}
                </span>
              )}
              {durationBadge && (
                <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#4338CA] uppercase">
                  {durationBadge}
                </span>
              )}
              {explanationMetadata?.compatibility_fit_band && (
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${getCompatibilityColor(explanationMetadata.compatibility_fit_band)}`}>
                  {getCompatibilityText(explanationMetadata.compatibility_fit_band)}
                </span>
              )}
              {matchPercentage !== undefined && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold tracking-wide text-green-600 uppercase ring-1 ring-inset ring-green-500/20">
                  {matchPercentage}% Match
                </span>
              )}
            </div>
          </div>
        )}

        <h3
          className={`mt-1.5 font-bold leading-tight text-[#1F2432] line-clamp-2 ${
            headlineLarge ? 'text-lg sm:text-xl' : 'text-xl sm:text-[22px]'
          }`}
        >
          {title}
        </h3>

        <p
          className={`mt-1.5 line-clamp-2 break-words text-[#5D6A85] ${isProgressVariant || isSimpleButtonVariant ? 'text-sm' : 'text-[15px]'}`}
        >
          {description}
        </p>

        {/* AI Insights & Match Reasons */}
        {((matchReasons && matchReasons.length > 0) || explanationMetadata) && (
          <div className="mt-3 mb-1 w-full flex flex-col items-start text-left px-3 py-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5 w-full">
              <div className="shrink-0 rounded-full bg-[#F3E8FF] p-1 text-[#8B5CF6]">
                <Lightbulb size={12} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Why this program?
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
              ) : explanationMetadata ? (
                <>
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
                </>
              ) : null}
            </ul>
          </div>
        )}

        {shouldShowProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-[#6C7285]">PROGRESS</span>
              <span className="text-xl font-bold leading-none text-[#6757B1]">
                {progressValue}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#DFE2E8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5D519E] to-[#56C2CE]"
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        )}

        {(author || authorText) && (
          <div className="flex items-center gap-3 mt-3">
            {hideAuthorAvatar ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F0FF] text-primary">
                {authorIcon}
              </span>
            ) : author ? (
              <ProfileAvatar pictureUrl={author.avatar} name={author.name} className="h-8 w-8 rounded-full object-cover" />
            ) : null}
            <span className="text-sm font-medium text-[#7D89A3]">{authorText ?? author?.name}</span>
          </div>
        )}

        <div className="flex gap-3 items-center mt-auto pt-4">

          <button
            className={`h-[50px] rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark w-full`}
            onClick={onPrimaryClick}
            type="button"
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProgramCard;
