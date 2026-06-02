import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { MOCK_AI_FEEDBACK_INSIGHTS } from './mockAiInsights';
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
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

    setActionError(null);
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
      setActionError(
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
    setActionError(null);
    setSuccessMessage(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModalForReview = (review: FeedbackReviewDto) => {
    setActionError(null);
    setSuccessMessage(null);
    setMyFeedback(review);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSubmitModal = async (payload: { rating: number; comment: string }) => {
    if (!selectedProgramId) {
      return;
    }
    setSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      if (modalMode === 'create') {
        await submitFeedback({
          programId: selectedProgramId,
          rating: payload.rating,
          comment: payload.comment,
        });
        setSuccessMessage('Feedback submitted successfully.');
      } else if (myFeedback?.feedbackId) {
        await updateFeedback(myFeedback.feedbackId, {
          rating: payload.rating,
          comment: payload.comment,
        });
        setSuccessMessage('Feedback updated successfully.');
      }

      setModalOpen(false);
      await Promise.all([loadPage(1, false), refreshFeedbackActionsState()]);
    } catch (submitError) {
      setActionError(
        submitError instanceof Error ? submitError.message : 'Failed to save feedback.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (review: FeedbackReviewDto) => {
    if (!review.feedbackId || deleting) {
      return;
    }

    const confirmed = window.confirm(
      'Delete your feedback? This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeletingFeedbackId(review.feedbackId);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await deleteFeedback(review.feedbackId);
      if (myFeedback?.feedbackId === review.feedbackId) {
        setMyFeedback(null);
      }
      setSuccessMessage('Feedback deleted successfully.');
      await Promise.all([loadPage(1, false), refreshFeedbackActionsState()]);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete feedback.'
      );
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
      <header>
        <h1 className="text-2xl font-bold text-[#1F2533]">Feedback & Reviews</h1>
        <p className="mt-1 text-sm text-[#6B7289]">
          Program feedback from mentees, plus AI-powered sentiment highlights.
        </p>
      </header>

      {isMentee && canManageFeedback && eligibility?.isEligible && !eligibility.alreadySubmitted ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreateModal}
            className="text-sm font-semibold text-primary transition hover:text-primary-dark"
          >
            Leave Feedback
          </button>
        </div>
      ) : null}

      {isMentee && canManageFeedback && eligibility && !eligibility.isEligible ? (
        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
          {eligibility.reason || 'You are not eligible to leave feedback for this program.'}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {actionError}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
          {successMessage}
        </div>
      ) : null}

      <FeedbackMetrics
        averageRating={data.averageRating}
        totalReviews={data.totalReviews}
        bayesianRating={data.bayesianRating}
      />

      <AIInsightsSection insights={MOCK_AI_FEEDBACK_INSIGHTS} />

      <ReviewsList
        reviews={reviews}
        totalReviews={data.totalReviews}
        page={data.page}
        totalPages={data.totalPages}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        currentUserId={isMentee ? currentUserId : undefined}
        onEditReview={isMentee ? openEditModalForReview : undefined}
        onDeleteReview={isMentee ? handleDeleteReview : undefined}
        deletingFeedbackId={deletingFeedbackId}
      />

      <FeedbackModal
        isOpen={modalOpen}
        mode={modalMode}
        submitting={submitting}
        initialRating={modalMode === 'edit' ? myFeedback?.rating ?? 0 : 0}
        initialComment={modalMode === 'edit' ? myFeedback?.comment ?? '' : ''}
        error={actionError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
