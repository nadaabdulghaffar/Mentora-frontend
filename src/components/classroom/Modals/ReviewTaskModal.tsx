import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface ReviewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (grade: number, feedback: string) => void;
  studentName?: string;
  taskTitle?: string;
  submissionContent?: string;
}

const ReviewTaskModal: React.FC<ReviewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
  studentName = 'Student',
  taskTitle = 'Task',
  submissionContent = '',
}) => {
  const [grade, setGrade] = useState(0);
  const [hoverGrade, setHoverGrade] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitReview(grade, feedback);
      resetForm();
      onClose();
    }, 500);
  };

  const resetForm = () => {
    setGrade(0);
    setFeedback('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2432]">Review Submission</h2>
            <p className="mt-1 text-sm text-[#6F7689]">
              {studentName} • {taskTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={24} className="text-[#6F7689]" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Submission Content */}
          {submissionContent && (
            <div className="rounded-xl border border-[#E6E9F2] bg-[#F8FAFB] p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#1F2432]">
                Student Submission
              </h3>
              <div className="prose prose-sm max-w-none rounded-lg bg-white p-4 text-[#5E667D]">
                {submissionContent}
              </div>
            </div>
          )}

          {/* Rating Section */}
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-[#1F2432]">
              Rating
            </label>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setGrade(star)}
                  onMouseEnter={() => setHoverGrade(star)}
                  onMouseLeave={() => setHoverGrade(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverGrade || grade)
                        ? 'fill-[#FFB800] text-[#FFB800]'
                        : 'text-[#E6E9F2]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-[#1F2432]">
              Feedback & Comments
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback on the student's work, areas of improvement, and strengths..."
              rows={5}
              className="mt-2 w-full rounded-xl border border-[#E6E9F2] bg-[#F8FAFB] px-4 py-3 text-sm placeholder-[#A0AABC] focus:border-[#6E56CF] focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border-2 border-[#E6E9F2] px-6 py-2.5 font-semibold text-[#1F2432] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={isSubmitting || grade === 0}
            className="rounded-xl bg-[#6E56CF] px-6 py-2.5 font-semibold text-white hover:bg-[#5E46BF] disabled:opacity-60"
          >
            {isSubmitting ? 'Sending Feedback...' : 'Send Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewTaskModal;
