import React from 'react';
import { X } from 'lucide-react';

export interface FeedbackView {
  id: string;
  taskTitle?: string;
  taskSubtitle?: string;
  mentorName?: string;
  rating?: number;
  grade?: number;
  feedback?: string;
  submittedDate?: string;
}

interface ViewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback?: FeedbackView | null;
}

const ViewFeedbackModal: React.FC<ViewFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
}) => {
  if (!isOpen || !feedback) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        {/* Close Button */}
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={24} className="text-[#6F7689]" />
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#1F2432]">{feedback.taskTitle}</h2>
          {feedback.submittedDate && (
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-[#667085]">
              <span>📅</span>
              <span>Submitted {feedback.submittedDate}</span>
            </p>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg className="absolute h-full w-full" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke="#E6E9F2"
                  strokeWidth="2"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke="#A89CF6"
                  strokeWidth="4"
                  strokeDasharray={`${(Number(feedback.grade ?? 70) / 100) * 596.9} 596.9`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>

              <div className="flex flex-col items-center">
                <span className="text-6xl font-semibold leading-none text-[#6A58C9]">
                  {feedback.grade ?? 70}
                </span>
                <span className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#4C5263]">
                  Final Grade
                </span>
                {feedback.taskSubtitle && (
                  <span className="mt-1 text-sm text-[#8B90A2]">{feedback.taskSubtitle}</span>
                )}
              </div>
            </div>
          </div>

          {/* Mentor Feedback */}
          {feedback.feedback && (
            <div className="relative rounded-2xl border border-[#E6E9F2] bg-[#F8FAFB] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2D7FF]">
                  <span className="text-sm font-bold text-[#6A58C9]">◔</span>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6A58C9]">
                  Mentor Feedback
                </h3>
              </div>
              <p className="whitespace-pre-wrap text-sm italic leading-7 text-[#5E667D]">
                "{feedback.feedback}"
              </p>
              <div className="pointer-events-none absolute right-4 top-4 text-6xl leading-none text-[#E9E9EE]">
                “"
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-[#E6E9F2] px-12 py-2.5 font-semibold text-[#1F2432] hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFeedbackModal;
