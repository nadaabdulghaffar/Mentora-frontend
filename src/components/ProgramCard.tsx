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
  title: string;
  description: string;
  progress?: number;
  author?: AuthorInfo;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  variant = 'simple-button',
  image,
  tag,
  phases,
  title,
  description,
  progress,
  author,
  primaryButtonText = 'Apply',
  secondaryButtonText = 'Details',
  onPrimaryClick,
  onSecondaryClick,
  className = '',
}) => {
  const progressValue = Math.max(0, Math.min(100, progress ?? 0));
  const isProgressVariant = variant === 'progress';
  const isSimpleButtonVariant = variant === 'simple-button';
  const shouldShowProgress = progress !== undefined;
  const hasImageHeader = variant === 'dual-buttons' || (isSimpleButtonVariant && Boolean(image));

  return (
    <article className={`overflow-hidden rounded-2xl border border-[#D8DBE4] bg-white shadow-[0_2px_8px_rgba(22,29,47,0.06)] ${className}`}>
      {hasImageHeader && image && (
        <div className="h-40 w-full bg-[#CDC2F2]">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={`p-4 ${isSimpleButtonVariant ? 'space-y-4 md:p-5' : 'space-y-3.5'}`}>
        {(tag || phases) && (
          <div className="flex items-center gap-2 text-xs">
            {tag && (
              <span className="rounded-md bg-[#F0ECFB] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6B57B5]">
                {tag}
              </span>
            )}
            {phases && (
              <span className="text-xs font-medium text-[#9AA3B6]">
                {phases}
              </span>
            )}
          </div>
        )}

        <h3
          className={`font-bold leading-tight text-[#1F2432] ${
            isProgressVariant
              ? 'text-2xl sm:text-[27px]'
              : isSimpleButtonVariant
                ? 'text-[24px] sm:text-[28px]'
                : 'text-[26px] sm:text-[28px]'
          }`}
        >
          {title}
        </h3>

        <p className={`text-[#5D6A85] ${isProgressVariant || isSimpleButtonVariant ? 'text-base' : 'text-[15px]'}`}>
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

        {hasImageHeader && author && (
          <div className="flex items-center gap-2">
            <img
              src={author.avatar}
              alt={author.name}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-[#7D89A3]">{author.name}</span>
          </div>
        )}

        <div className={`flex gap-2.5 ${variant === 'dual-buttons' ? 'justify-end' : ''}`}>
          {variant === 'dual-buttons' && (
            <button
              className="min-w-[88px] h-[54px] rounded-xl border border-[#C4CAD7] px-3.5 text-sm font-semibold text-[#2E3547] transition hover:bg-[#F5F7FB]"
              onClick={onSecondaryClick}
              type="button"
            >
              {secondaryButtonText}
            </button>
          )}

          <button
            className={`${isSimpleButtonVariant ? 'h-[48px]' : 'h-[54px]'} rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark ${
              variant === 'dual-buttons' ? 'flex-1' : 'w-full'
            }`}
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
