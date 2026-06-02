import { useEffect, useMemo, useState } from 'react';
import { MessageSquareText, Star } from 'lucide-react';
import { Modal } from '../../../components/Modal';

const MAX_COMMENT_LENGTH = 1000;

interface FeedbackModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  submitting: boolean;
  initialRating?: number;
  initialComment?: string;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment: string }) => void;
}

export function FeedbackModal({
  isOpen,
  mode,
  submitting,
  initialRating = 0,
  initialComment = '',
  error,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setRating(initialRating);
    setComment(initialComment);
    setValidationError('');
  }, [isOpen, initialRating, initialComment]);

  const actionLabel = mode === 'create' ? 'Submit Feedback' : 'Save Changes';
  const title = mode === 'create' ? 'Leave Feedback' : 'Edit Feedback';
  const helperText = useMemo(
    () =>
      mode === 'create'
        ? 'Share your mentoring experience for this program.'
        : 'Update your rating or comment for this program.',
    [mode]
  );

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      setValidationError('Please select a rating from 1 to 5 stars.');
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > MAX_COMMENT_LENGTH) {
      setValidationError(`Comment must be ${MAX_COMMENT_LENGTH} characters or less.`);
      return;
    }

    setValidationError('');
    onSubmit({ rating, comment: trimmedComment });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-xl overflow-hidden p-0">
      <div className="border-b border-[#ECEFF5] px-6 py-5">
        <h2 className="text-xl font-bold text-[#1F2533]">{title}</h2>
        <p className="mt-1 text-sm text-[#6B7289]">{helperText}</p>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#3D4559]">Rating *</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              const active = value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded-lg p-1 transition hover:scale-105"
                  aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
                >
                  <Star
                    size={26}
                    className={active ? 'text-[#4DB6AC]' : 'text-[#D8DCE8]'}
                    fill={active ? 'currentColor' : 'none'}
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm font-semibold text-[#5C6378]">
              {rating > 0 ? `${rating}/5` : 'Select rating'}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3D4559]">
            <MessageSquareText size={16} className="text-primary" />
            Comment
          </label>
          <textarea
            value={comment}
            maxLength={MAX_COMMENT_LENGTH}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write your feedback (optional)"
            rows={5}
            className="w-full resize-none rounded-xl border border-[#D8DCE8] px-4 py-3 text-sm text-[#1F2533] outline-none transition focus:border-primary"
          />
          <p className="mt-1 text-right text-xs text-[#8B92A8]">
            {comment.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>

        {validationError ? (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
            {validationError}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
            {error}
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-3 border-t border-[#ECEFF5] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-[#5C6378] transition hover:bg-[#F4F5FA] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? 'Saving…' : actionLabel}
        </button>
      </div>
    </Modal>
  );
}
