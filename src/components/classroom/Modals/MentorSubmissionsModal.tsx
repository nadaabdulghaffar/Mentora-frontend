import React from 'react';
import { X } from 'lucide-react';
import { ClassroomUserLink } from '../common/ClassroomUserLink';
import { ProfileAvatar } from '../../profile/ProfileAvatar';

export type MentorSubmissionSummary = {
  id: string;
  studentId?: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  fileCount: number;
reviewStatus:
  | 'reviewed'
  | 'pending'
  | 'revision_requested'
  | 'draft';
};

type MentorSubmissionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  submissions: MentorSubmissionSummary[];
  onViewTask: (submissionId: string) => void;
};

const MentorSubmissionsModal = ({
  isOpen,
  onClose,
  taskTitle,
  submissions,
  onViewTask,
}: MentorSubmissionsModalProps) => {
  const [filter, setFilter] = React.useState<'all' | 'reviewed' | 'pending'>('all');

  if (!isOpen) {
    return null;
  }

  const filteredSubmissions = submissions.filter((submission) => {
    if (filter === 'reviewed') {
      return (
        submission.reviewStatus === 'reviewed' ||
        submission.reviewStatus === 'revision_requested'
      );
    }

    if (filter === 'pending') {
      return submission.reviewStatus === 'pending';
    }

    return submission.reviewStatus !== 'draft';
  });

  const reviewedCount = submissions.filter(
    (submission) =>
      submission.reviewStatus === 'reviewed' ||
      submission.reviewStatus === 'revision_requested'
  ).length;
  const pendingCount = submissions.filter(
    (submission) => submission.reviewStatus === 'pending'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-[28px] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#EEF1F7] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C8294]">Live Overview</p>
            <h2 className="mt-1 text-2xl font-bold text-[#1F2432]">{taskTitle ?? 'Submitted Tasks'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#7A8094] hover:bg-[#F5F7FB]" aria-label="Close submissions modal">
            <X size={22} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === 'all' ? 'bg-[#5E4BC5] text-white' : 'bg-[#F4F6FB] text-[#667085]'}`}
          >
            All ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('reviewed')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === 'reviewed' ? 'bg-[#5E4BC5] text-white' : 'bg-[#F4F6FB] text-[#667085]'}`}
          >
            Reviewed ({reviewedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === 'pending' ? 'bg-[#5E4BC5] text-white' : 'bg-[#F4F6FB] text-[#667085]'}`}
          >
            Pending Review ({pendingCount})
          </button>
        </div>

        <div className="space-y-3">
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E3E7F0] p-8 text-center text-sm text-[#8D95A8]">
              No student submissions yet.
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6E9F2] bg-[#FCFCFE] px-4 py-4">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    pictureUrl={submission.studentAvatar}
                    name={submission.studentName}
                    className="h-11 w-11 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <ClassroomUserLink
                        userId={submission.studentId}
                        name={submission.studentName}
                        className="text-lg font-semibold text-[#1F2432]"
                      />
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                          submission.reviewStatus === 'reviewed'
                            ? 'bg-[#DDF6F0] text-[#0E7A5F]'
                            : submission.reviewStatus === 'revision_requested'
                              ? 'bg-[#FFE6EA] text-[#AF2F4D]'
                              : 'bg-[#F4F6FB] text-[#667085]'
                        }`}
                      >
                        {submission.reviewStatus === 'reviewed'
                          ? 'Reviewed'
                          : submission.reviewStatus === 'revision_requested'
                            ? 'Revision Requested'
                            : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-[#6F7689]">Submitted {submission.submittedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onViewTask(submission.id)}
                    className="rounded-xl bg-[#5E4BC5] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5441B7]"
                  >
                    View Task
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorSubmissionsModal;