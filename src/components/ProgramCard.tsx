import React from 'react';

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
  description: string;
  progress?: number;
  author?: AuthorInfo;
  authorText?: string;
  authorIcon?: React.ReactNode;
  hideAuthorAvatar?: boolean;
  hideHeaderImage?: boolean;
  primaryButtonText?: string;
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
  onPrimaryClick,
  className = '',
}) => {
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
              <img src={author.avatar} alt={author.name} className="h-8 w-8 rounded-full object-cover" />
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
