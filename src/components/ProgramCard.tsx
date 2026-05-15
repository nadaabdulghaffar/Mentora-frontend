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
  authorText?: string;
  authorIcon?: React.ReactNode;
  hideAuthorAvatar?: boolean;
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
  authorText,
  authorIcon,
  hideAuthorAvatar = false,
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
  const hasImageHeader =
    variant === 'dual-buttons' ||
    (isProgressVariant && Boolean(image)) ||
    (isSimpleButtonVariant && Boolean(image));
  const headlineLarge = variant === 'dual-buttons' || (isProgressVariant && Boolean(image));

  return (
    <article className={`overflow-hidden rounded-2xl border border-[#D8DBE4] bg-white shadow-[0_2px_8px_rgba(22,29,47,0.06)] ${className}`}>
      {hasImageHeader && image && (
        <div className="h-32 w-full bg-[#CDC2F2] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={`p-3.5 ${isSimpleButtonVariant ? 'space-y-2.5 md:p-3.5' : 'space-y-2.5'}`}>
        {(tag || phases) && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {tag && (
                <span className="rounded-full bg-[#F4F0FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#6B57B5]">
                  {tag}
                </span>
              )}
              {phases && (
                <span className="text-xs font-medium text-[#9AA3B6]">{phases}</span>
              )}
            </div>
          </div>
        )}

        <h3
          className={`mt-1.5 font-extrabold leading-tight text-[#1F2432] ${
            headlineLarge ? 'min-h-0 text-[22px] sm:text-[22px]' : 'text-2xl sm:text-3xl'
          } ${variant === 'dual-buttons' ? 'min-h-[62px]' : ''}`}
        >
          {title}
        </h3>

        <p
          className={`mt-1.5 text-[#5D6A85] ${isProgressVariant || isSimpleButtonVariant ? 'text-sm' : 'text-[15px]'} ${
            variant === 'dual-buttons' ? 'min-h-[52px]' : ''
          }`}
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

        {hasImageHeader && (author || authorText) && (
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

        <div className="flex gap-3 items-center">
          {variant === 'dual-buttons' && (
            <button
              className="min-w-[88px] h-[50px] rounded-xl border border-[#C4CAD7] px-3.5 text-sm font-semibold text-[#2E3547] transition hover:bg-[#F5F7FB]"
              onClick={onSecondaryClick}
              type="button"
            >
              {secondaryButtonText}
            </button>
          )}

          <button
            className={`${isSimpleButtonVariant ? 'h-[46px]' : 'h-[50px]'} rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark ${
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
