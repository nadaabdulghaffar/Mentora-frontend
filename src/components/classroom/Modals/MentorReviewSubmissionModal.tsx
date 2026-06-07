import React, { 
    useEffect,
useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  X,
} from 'lucide-react';



import type { MentorSubmissionSummary } from './MentorSubmissionsModal';
import { ClassroomUserLink } from '../common/ClassroomUserLink';

export type MentorSubmissionAttachment = {
  id: string;

  name: string;

  type: 'link';

  url: string;

  sizeLabel?: string;
};

export type MentorSubmissionReview =
  MentorSubmissionSummary & {

    taskTitle: string;

    submittedAtLabel: string;

    attachments:
      MentorSubmissionAttachment[];

    grade: number;

    feedback: string;

    summary?: string;
  };

type MentorReviewSubmissionModalProps = {
  isOpen: boolean;

  onClose: () => void;

  submission:
    MentorSubmissionReview | null;

  onSubmitReview: (
    grade: number,
    feedback: string,
    requestRevision: boolean
  ) => void;
};

const MentorReviewSubmissionModal = ({
  isOpen,
  onClose,
  submission,
  onSubmitReview,
}: MentorReviewSubmissionModalProps) => {

  const [grade, setGrade] =
    useState(submission?.grade ?? 70);

  const [feedback, setFeedback] =
    useState(submission?.feedback ?? '');


    useEffect(() => {

  if (!submission) {
    return;
  }

  setGrade(
    submission.grade ?? 0
  );

  setFeedback(
    submission.feedback ?? ''
  );

}, [submission]);

  if (!isOpen || !submission) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const isReviewed = submission.reviewStatus === 'reviewed';
  const isRevisionRequested =
    submission.reviewStatus === 'revision_requested';
  const isReadOnly = isReviewed || isRevisionRequested;

  const handleSubmit = (
  requestRevision: boolean
) => {

  if (
    requestRevision &&
    !feedback.trim()
  ) {

    alert(
      "Please provide feedback before requesting a revision."
    );

    return;
  }

  if (
    !requestRevision &&
    (
      grade < 0 ||
      grade > 100
    )
  ) {

    alert(
      "Grade must be between 0 and 100."
    );

    return;
  }

  onSubmitReview(
    grade,
    feedback,
    requestRevision
  );

};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-5xl rounded-[28px] bg-white shadow-xl">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F7] px-6 py-5">

          <div className="space-y-1">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C8294]">

              Review Assignment &gt;{' '}

              {submission.taskTitle}

            </p>

            <div className="flex items-center gap-3">

              <img
                src={submission.studentAvatar}
                alt={submission.studentName}
                className="h-10 w-10 rounded-full object-cover"
              />

              <div>

                <ClassroomUserLink
                  userId={submission.studentId}
                  name={submission.studentName}
                  className="text-2xl font-bold leading-none text-[#1F2432]"
                />

                <p className="text-sm text-[#6F7689]">

                  {submission.submittedAtLabel}

                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-[#7A8094] hover:bg-[#F5F7FB]"
            aria-label="Close review modal"
          >

            <X size={22} />

          </button>

        </div>

        {/* BODY */}

        <div className="grid gap-5 p-6 lg:grid-cols-[1.4fr_0.9fr]">

          {/* LEFT */}

          <div className="space-y-5">

            {/* SUBMISSION LINKS */}

            <div className="rounded-[22px] border border-[#E6E9F2] bg-white p-5">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-2 text-[#1F2432]">

                  <FileText
                    size={16}
                    className="text-[#6E56CF]"
                  />

                  <h3 className="text-lg font-semibold">

                    Student Submission

                  </h3>

                </div>

                <span className="text-sm font-semibold text-[#6E56CF]">

                  {submission.attachments.length}{' '}

                  {submission.attachments.length === 1
                    ? 'Attachment'
                    : 'Attachments'}
                </span>

              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">

                {submission.attachments.map(
                  (attachment) => (

                    <div
                      key={attachment.id}
                      className="flex items-center justify-between rounded-2xl border border-[#E6E9F2] bg-[#FCFCFE] px-4 py-3"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8DAFD] text-[#6E56CF]">

                          <FileText size={18} />

                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-[#1F2432]">

                            {attachment.name}

                          </p>

                          <p className="truncate text-xs text-[#6F7689] max-w-[180px]">

                            {attachment.url}

                          </p>

                        </div>

                      </div>

                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-[#6E56CF] hover:bg-[#F5F3FF]"
                      >

                        <ExternalLink size={18} />

                      </a>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* NOTES */}

            {submission.summary && (

              <div className="rounded-[22px] border border-[#E6E9F2] bg-white p-5">

                <h3 className="text-lg font-semibold text-[#1F2432]">

                  Notes For Mentor

                </h3>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4A5162]">

                  {submission.summary}

                </p>

              </div>

            )}

            {/* FEEDBACK */}

            <div className="rounded-[22px] border border-[#E6E9F2] bg-[#FCFCFE] p-5">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h3 className="text-lg font-semibold text-[#1F2432]">

                    Detailed Feedback

                  </h3>

                  <p className="text-sm text-[#6F7689]">

                    Coach the student on their technique and execution.

                  </p>

                </div>



              </div>

              <textarea
                disabled={isReadOnly}
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                placeholder="Enter your detailed professional feedback..."
                rows={9}
                className="mt-4 w-full rounded-[18px] border border-[#E6E9F2] bg-white px-4 py-3 text-sm text-[#1F2432] outline-none placeholder:text-[#9AA1B1] focus:border-[#6E56CF]"
              />

            </div>

          </div>

          {/* RIGHT */}

          <div className="rounded-[22px] border border-[#E6E9F2] bg-[#FCFCFE] p-5">

            <h3 className="text-xl font-semibold text-[#1F2432]">

              Final Assessment

            </h3>

            <div className="mt-5 flex items-center gap-4">

              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#E8DAFD] text-4xl font-bold text-[#6E56CF]">

                {grade}%

              </div>

              <div className="flex-1">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C8294]">

                  Assign Grade

                </p>

                <div className="relative mt-2">

                  <input
                    type="number"
                    min={0}
                    max={100}
                    disabled={isReadOnly}
                    value={grade}
                    onChange={(event) => {

  const value =
    Number(
      event.target.value
    );

  setGrade(
    Math.min(
      100,
      Math.max(
        0,
        value
      )
    )
  );

}}
                    className="w-full rounded-xl border border-[#E6E9F2] bg-white px-4 py-3 text-sm font-semibold text-[#1F2432] outline-none focus:border-[#6E56CF]"
                  />


                </div>

              </div>

            </div>
            {!isReadOnly && (
  <>

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
            </>
            )}

            {isReviewed && (
  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">

    <p className="font-semibold text-green-700">
      Final Review Submitted
    </p>

    <p className="text-sm text-green-600">
      This submission has already been reviewed.
    </p>

  </div>
)}

            {isRevisionRequested && (
  <div className="mt-6 rounded-xl border border-[#F5D0D8] bg-[#FFF5F7] p-4">

    <p className="font-semibold text-[#AF2F4D]">
      Revision Requested
    </p>

    <p className="text-sm text-[#8D3E52]">
      The mentee has been asked to revise and resubmit this task.
    </p>

  </div>
)}

          </div>

        </div>

      </div>

    </div>
  );
};

export default MentorReviewSubmissionModal;