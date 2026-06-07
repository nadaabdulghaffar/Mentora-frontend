import React from 'react';
import { X, FileText, Download, Link as LinkIcon } from 'lucide-react';

export interface SubmissionFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface SubmissionView {
  id: string;
  studentName?: string;
  taskTitle?: string;
  submittedDate?: string;
  files?: SubmissionFile[];
  links: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  notes?: string;
  status?: 'submitted' | 'under_review' | 'reviewed';
}

interface ViewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission?: SubmissionView | null;
  onUpdateSubmission?: () => void;
}

function isLinkFile(file: SubmissionFile): boolean {
  return (
    file.type === 'LINK' ||
    file.size === 'LINK' ||
    (!!file.url && (file.url.startsWith('http://') || file.url.startsWith('https://')))
  );
}

const ViewSubmissionModal: React.FC<ViewSubmissionModalProps> = ({
  isOpen,
  onClose,
  submission,
  onUpdateSubmission,
}) => {
  if (!isOpen || !submission) return null;

  const handleUpdate = () => {
    if (onUpdateSubmission) {
      onUpdateSubmission();
    }
  };

  const handleOpenLink = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span
              className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                submission.status === 'reviewed'
                  ? 'bg-[#D5F4E6] text-[#0B8A73]'
                  : submission.status === 'under_review'
                    ? 'bg-[#E8DAFD] text-[#6E56CF]'
                    : 'bg-[#E3E7F0] text-[#667085]'
              }`}
            >
              {submission.status === 'reviewed'
                ? 'REVIEWED'
                : submission.status === 'under_review'
                  ? 'UNDER REVIEW'
                  : 'SUBMITTED'}
            </span>
            <h2 className="text-2xl font-bold text-[#1F2432]">{submission.taskTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={24} className="text-[#6F7689]" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#E6E9F2] bg-[#F8FAFB] p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#1F2432]">
              Submission Summary
            </h3>

            {submission.files && submission.files.length > 0 && (
              <div className="space-y-3">
                {submission.files.map((file) => {
                  const isLink = isLinkFile(file);

                  return (
                    <div key={file.id} className="flex items-center gap-3 rounded-lg p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8DAFD]">
                        {isLink ? (
                          <LinkIcon size={20} className="text-[#6E56CF]" />
                        ) : (
                          <FileText size={20} className="text-[#6E56CF]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1F2432]">{file.name}</p>
                        <p className="text-xs text-[#A0AABC]">
                          {file.size} • {file.type}
                        </p>
                      </div>
                      {isLink && file.url ? (
                        <button
                          type="button"
                          onClick={() => handleOpenLink(file.url!)}
                          className="rounded-lg p-2 hover:bg-[#E6E9F2]"
                          aria-label={`Open link ${file.name}`}
                        >
                          <LinkIcon size={18} className="text-[#6E56CF]" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => file.url && handleOpenLink(file.url)}
                          className="rounded-lg p-2 hover:bg-[#E6E9F2]"
                          aria-label={`Download ${file.name}`}
                        >
                          <Download size={18} className="text-[#6E56CF]" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {submission.submittedDate && (
              <p className="mt-4 border-t border-[#E6E9F2] pt-4 text-sm text-[#667085]">
                <span className="font-semibold">Submitted on</span>
                <br />
                {submission.submittedDate}
              </p>
            )}
          </div>

          <div className="flex gap-3 rounded-xl border border-[#D5CCFF] bg-[#F5F3FF] p-4">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E8DAFD]">
              <span className="text-sm font-bold text-[#6E56CF]">ℹ</span>
            </div>
            <p className="text-sm text-[#6E56CF]">
              Your mentor has been notified. You will receive an email once the feedback and grading are completed.
            </p>
          </div>

          {submission.notes && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#1F2432]">
                Your Notes
              </h3>
              <div className="rounded-lg border border-[#E6E9F2] bg-[#F8FAFB] p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#5E667D]">
                  {submission.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-3">
         
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissionModal;
