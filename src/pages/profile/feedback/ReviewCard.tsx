import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Star } from 'lucide-react';
import { ProfileAvatar } from '../../../components/profile/ProfileAvatar';
import type { FeedbackReviewDto } from './types';
import { formatReviewDate } from './utils';

interface ReviewCardProps {
  review: FeedbackReviewDto;
  showOwnerMenu?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function ReviewCard({
  review,
  showOwnerMenu = false,
  onEdit,
  onDelete,
  isDeleting = false,
}: ReviewCardProps) {
  const displayDate = formatReviewDate(review.createdAt);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <article className="relative rounded-3xl border border-[#E8EBF2] bg-white p-6 shadow-sm">
      {showOwnerMenu ? (
        <div ref={menuRef} className="absolute right-4 top-4 z-10">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7289] transition hover:bg-[#F4F5FA] hover:text-[#1F2533]"
            aria-label="Review options"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen ? (
            <div
              className="absolute right-0 top-11 min-w-[160px] rounded-2xl border border-[#ECEFF5] bg-white p-2 shadow-xl"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.();
                }}
                className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#1F2533] transition hover:bg-[#F4F5FA]"
              >
                Edit Review
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete?.();
                }}
                disabled={isDeleting}
                className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting…' : 'Delete Review'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={`flex flex-wrap items-start gap-3 ${showOwnerMenu ? 'pr-10' : ''}`}>
        <ProfileAvatar
          pictureUrl={review.reviewerProfilePicture}
          name={review.reviewerName}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-semibold text-[#1F2533]">{review.reviewerName}</p>
            <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={index < review.rating ? 'text-[#4DB6AC]' : 'text-[#ECEFF5]'}
                  fill={index < review.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          </div>
          <p className="mt-0.5 text-sm font-medium text-primary">{review.programTitle}</p>
        </div>
        {displayDate ? (
          <time dateTime={review.createdAt} className="text-xs font-medium text-[#9CA3B8]">
            {displayDate}
          </time>
        ) : null}
      </div>
      {review.comment?.trim() ? (
        <p className="mt-4 text-sm leading-relaxed text-[#5C6378]">{review.comment}</p>
      ) : (
        <p className="mt-4 text-sm italic text-[#9CA3B8]">No written comment provided.</p>
      )}
    </article>
  );
}
