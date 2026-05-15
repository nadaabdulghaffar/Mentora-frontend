import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, Download, FileText, X } from 'lucide-react';
import type { MentorSubmissionSummary } from './MentorSubmissionsModal';

export type MentorSubmissionAttachment = {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'link';
  sizeLabel?: string;
};

export type MentorSubmissionReview = MentorSubmissionSummary & {
  taskTitle: string;
  submittedAtLabel: string;
  attachments: MentorSubmissionAttachment[];
  grade: number;
  feedback: string;
  summary?: string;
};

type MentorReviewSubmissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  submission: MentorSubmissionReview | null;
  onSubmitReview: (grade: number, feedback: string, requestRevision: boolean) => void;
};

const MentorReviewSubmissionModal = ({
  isOpen,
  onClose,
  submission,
  onSubmitReview,
}: MentorReviewSubmissionModalProps) => {
  const [grade, setGrade] = useState(submission?.grade ?? 70);
  const [feedback, setFeedback] = useState(submission?.feedback ?? '');

  if (!isOpen || !submission) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (requestRevision: boolean) => {
    onSubmitReview(grade, feedback, requestRevision);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-[28px] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F7] px-6 py-5">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C8294]">Review Assignment &gt; {submission.taskTitle}</p>
            <div className="flex items-center gap-3">
              <img src={submission.studentAvatar} alt={submission.studentName} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <h2 className="text-2xl font-bold leading-none text-[#1F2432]">{submission.studentName}</h2>
                <p className="text-sm text-[#6F7689]">{submission.submittedAtLabel}</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full p-2 text-[#7A8094] hover:bg-[#F5F7FB]" aria-label="Close review modal">
            <X size={22} />
          </button>
        </div>

        <div className="grid gap-5 p-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-[22px] border border-[#E6E9F2] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#1F2432]">
                  <FileText size={16} className="text-[#6E56CF]" />
                  <h3 className="text-lg font-semibold">Student Submission</h3>
                </div>
                <button type="button" className="text-sm font-semibold text-[#6E56CF]">Download All</button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {submission.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between rounded-2xl border border-[#E6E9F2] bg-[#FCFCFE] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8DAFD] text-[#6E56CF]">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2432]">{attachment.name}</p>
                        {attachment.sizeLabel && <p className="text-xs text-[#6F7689]">{attachment.sizeLabel}</p>}
                      </div>
                    </div>
                    <button type="button" className="rounded-lg p-2 text-[#6E56CF] hover:bg-[#F5F3FF]">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#E6E9F2] bg-[#FCFCFE] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2432]">Detailed Feedback</h3>
                  <p className="text-sm text-[#6F7689]">Coach the student on their technique and execution.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#E6E9F2] bg-white px-2 py-1 text-[#6F7689]">
                  <button type="button" className="rounded-lg px-2 py-1 text-sm font-semibold hover:bg-[#F5F7FB]">B</button>
                  <button type="button" className="rounded-lg px-2 py-1 text-sm font-semibold italic hover:bg-[#F5F7FB]">I</button>
                  <button type="button" className="rounded-lg px-2 py-1 text-sm font-semibold hover:bg-[#F5F7FB]">≡</button>
                </div>
              </div>

              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Enter your detailed professional feedback..."
                rows={9}
                className="mt-4 w-full rounded-[18px] border border-[#E6E9F2] bg-white px-4 py-3 text-sm text-[#1F2432] outline-none placeholder:text-[#9AA1B1] focus:border-[#6E56CF]"
              />
            </div>
          </div>

          <div className="rounded-[22px] border border-[#E6E9F2] bg-[#FCFCFE] p-5">
            <h3 className="text-xl font-semibold text-[#1F2432]">Final Assessment</h3>

            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#E8DAFD] text-4xl font-bold text-[#6E56CF]">
                {grade}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C8294]">Assign Grade</p>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={grade}
                    onChange={(event) => setGrade(Number(event.target.value))}
                    className="w-full rounded-xl border border-[#E6E9F2] bg-white px-4 py-3 text-sm font-semibold text-[#1F2432] outline-none focus:border-[#6E56CF]"
                  />
                  <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7689]" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6E56CF] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(110,86,207,0.22)]"
            >
              <CheckCircle2 size={16} />
              Submit Grade & Feedback
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#6E56CF] bg-white px-5 py-3 text-sm font-semibold text-[#6E56CF]"
            >
              Request Revision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorReviewSubmissionModal;