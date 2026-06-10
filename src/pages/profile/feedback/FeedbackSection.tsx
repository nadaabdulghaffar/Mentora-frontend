import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import authAPI from '../../../services/authService';
import {
  deleteFeedback,
  getFeedbackEligibility,
  getMentorReviews,
  getMyFeedback,
  submitFeedback,
  updateFeedback,
} from '../../../services/feedbackService';
import { AIInsightsSection } from './AIInsightsSection';
import { FeedbackMetrics } from './FeedbackMetrics';
import { FeedbackModal } from './FeedbackModal';
import { notifySuccess, notifyError } from '../../../utils/toast';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import { ReviewsList } from './ReviewsList';
import type {
  FeedbackEligibilityResponse,
  FeedbackReviewDto,
  MentorReviewsResponse,
} from './types';

interface FeedbackSectionProps {
  mentorUserId: string;
}

export function FeedbackSection({ mentorUserId }: FeedbackSectionProps) {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<MentorReviewsResponse | null>(null);
  const [reviews, setReviews] = useState<FeedbackReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eligibility, setEligibility] = useState<FeedbackEligibilityResponse | null>(null);
  const [myFeedback, setMyFeedback] = useState<FeedbackReviewDto | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackReviewDto | null>(null);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useMemo(() => authAPI.getCurrentUser(), []);
  const isMentee = currentUser?.role?.toLowerCase() === 'mentee';
  const selectedProgramId = useMemo(() => {
    const raw = searchParams.get('programId');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);
  const canManageFeedback = isMentee && selectedProgramId !== null;
  const currentUserId = currentUser?.userId;

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const response = await getMentorReviews(mentorUserId, page);
        setData(response);
        setReviews((prev) =>
          append ? [...prev, ...response.reviews] : response.reviews
        );
      } catch (loadError) {
        if (!append) {
          setData(null);
          setReviews([]);
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load feedback and reviews.'
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [mentorUserId]
  );

  const refreshFeedbackActionsState = useCallback(async () => {
    if (!canManageFeedback || selectedProgramId === null) {
      setEligibility(null);
      setMyFeedback(null);
      return;
    }

    try {
      const eligibilityResponse = await getFeedbackEligibility(selectedProgramId);
      setEligibility(eligibilityResponse);

      if (eligibilityResponse.alreadySubmitted) {
        const ownFeedback = await getMyFeedback(selectedProgramId);
        setMyFeedback(ownFeedback);
      } else {
        setMyFeedback(null);
      }
    } catch (stateError) {
      setEligibility(null);
      setMyFeedback(null);
      notifyError(
        stateError instanceof Error
          ? stateError.message
          : 'Failed to load feedback actions state.'
      );
    }
  }, [canManageFeedback, selectedProgramId]);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    void refreshFeedbackActionsState();
  }, [refreshFeedbackActionsState]);

  const handleLoadMore = () => {
    if (!data || loadingMore || data.page >= data.totalPages) {
      return;
    }
    void loadPage(data.page + 1, true);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModalForReview = (review: FeedbackReviewDto) => {
    setMyFeedback(review);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSubmitModal = async (payload: { rating: number; comment: string }) => {
    if (!selectedProgramId) {
      return;
    }
    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        await submitFeedback({
          programId: selectedProgramId,
          rating: payload.rating,
          comment: payload.comment,
        });
        notifySuccess('Feedback submitted successfully.');
      } else if (myFeedback?.feedbackId) {
        await updateFeedback(myFeedback.feedbackId, {
          rating: payload.rating,
          comment: payload.comment,
        });
        notifySuccess('Feedback updated successfully.');
      }

      setModalOpen(false);
      await Promise.all([loadPage(1, false), refreshFeedbackActionsState()]);
    } catch (submitError) {
      notifyError(
        submitError instanceof Error ? submitError.message : 'Failed to save feedback.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteReview = (review: FeedbackReviewDto) => {
    setFeedbackToDelete(review);
  };

  const executeDeleteReview = async () => {
    if (!feedbackToDelete || !feedbackToDelete.feedbackId || deleting) {
      return;
    }

    setDeleting(true);
    setDeletingFeedbackId(feedbackToDelete.feedbackId);
    try {
      await deleteFeedback(feedbackToDelete.feedbackId);
      if (myFeedback?.feedbackId === feedbackToDelete.feedbackId) {
        setMyFeedback(null);
      }
      notifySuccess('Feedback deleted successfully.');
      await Promise.all([loadPage(1, false), refreshFeedbackActionsState()]);
      setFeedbackToDelete(null);
    } catch (deleteError) {
      notifyError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete feedback.'
      );
      setFeedbackToDelete(null);
    } finally {
      setDeleting(false);
      setDeletingFeedbackId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-[#E8EBF2] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-[#6B7289]">Loading feedback & reviews…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-[#991B1B]">Unable to load reviews</h2>
        <p className="mt-2 text-sm text-[#B91C1C]">{error}</p>
        <button
          type="button"
          onClick={() => void loadPage(1, false)}
          className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2533]">Feedback & Reviews</h1>
          <p className="mt-1 text-sm text-[#6B7289]">
            Program feedback from mentees, plus AI-powered sentiment highlights.
          </p>
        </div>

        {isMentee && canManageFeedback && eligibility?.isEligible && !eligibility.alreadySubmitted ? (
          <div className="shrink-0">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D2D8E6] bg-white px-5 text-sm font-semibold text-[#1F2533] shadow-sm transition hover:bg-[#F8F9FB] hover:border-[#C4CBDB] active:bg-[#F0F2F7]"
            >
              <MessageSquare size={18} className="text-[#1F2533]" />
              Leave Feedback
            </button>
          </div>
        ) : null}
      </header>

      {isMentee && canManageFeedback && eligibility && !eligibility.isEligible ? (
        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
          {eligibility.reason || 'You are not eligible to leave feedback for this program.'}
        </div>
      ) : null}


      <FeedbackMetrics
        averageRating={data.averageRating}
        totalReviews={data.totalReviews}
        bayesianRating={data.bayesianRating}
      />

      <AIInsightsSection mentorUserId={mentorUserId} />

      <ReviewsList
        reviews={reviews}
        totalReviews={data.totalReviews}
        page={data.page}
        totalPages={data.totalPages}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        currentUserId={isMentee ? currentUserId : undefined}
        onEditReview={isMentee ? openEditModalForReview : undefined}
        onDeleteReview={isMentee ? confirmDeleteReview : undefined}
        deletingFeedbackId={deletingFeedbackId}
      />

      <FeedbackModal
        isOpen={modalOpen}
        mode={modalMode}
        submitting={submitting}
        initialRating={modalMode === 'edit' ? myFeedback?.rating ?? 0 : 0}
        initialComment={modalMode === 'edit' ? myFeedback?.comment ?? '' : ''}
        error={undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitModal}
      />

      <ConfirmationModal
        isOpen={!!feedbackToDelete}
        onConfirm={executeDeleteReview}
        onCancel={() => setFeedbackToDelete(null)}
        title="Delete Review?"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete Review"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
