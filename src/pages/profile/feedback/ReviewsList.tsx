import { ReviewCard } from './ReviewCard';
import type { FeedbackReviewDto } from './types';

interface ReviewsListProps {
  reviews: FeedbackReviewDto[];
  totalReviews: number;
  page: number;
  totalPages: number;
  loadingMore: boolean;
  onLoadMore: () => void;
  currentUserId?: string;
  onEditReview?: (review: FeedbackReviewDto) => void;
  onDeleteReview?: (review: FeedbackReviewDto) => void;
  deletingFeedbackId?: string | null;
}

export function ReviewsList({
  reviews,
  totalReviews,
  page,
  totalPages,
  loadingMore,
  onLoadMore,
  currentUserId,
  onEditReview,
  onDeleteReview,
  deletingFeedbackId,
}: ReviewsListProps) {
  const hasMore = page < totalPages;

  return (
    <section aria-labelledby="reviews-list-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="reviews-list-heading" className="text-xl font-bold text-[#1F2533]">
            Reviews
          </h2>
          <p className="mt-1 text-sm text-[#6B7289]">
            {totalReviews === 0
              ? 'No reviews yet.'
              : `Showing ${reviews.length} of ${totalReviews} review${totalReviews === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#D8DCE8] bg-[#F8F9FD] px-6 py-12 text-center">
          <p className="text-sm font-medium text-[#5C6378]">
            This mentor has not received any program feedback yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const isOwner =
              !!currentUserId && review.menteeProfileId === currentUserId;
            const canManage = isOwner && !!onEditReview && !!onDeleteReview;

            return (
              <li key={review.feedbackId}>
                <ReviewCard
                  review={review}
                  showOwnerMenu={canManage}
                  onEdit={() => onEditReview?.(review)}
                  onDelete={() => onDeleteReview?.(review)}
                  isDeleting={deletingFeedbackId === review.feedbackId}
                />
              </li>
            );
          })}
        </ul>
      )}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-full border border-[#D8DCE8] bg-white px-8 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F8F9FD] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? 'Loading…' : 'Load more reviews'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
