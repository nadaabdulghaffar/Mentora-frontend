import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface SubmissionLink {
  id: string;
  title: string;
  url: string;
}

type LinkFieldErrors = {
  title?: string;
  url?: string;
};

interface SubmitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (links: SubmissionLink[], notes: string) => void;
  taskTitle?: string;
  initialLinks?: SubmissionLink[];
  initialNotes?: string;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

function validateSubmissionLinks(
  links: SubmissionLink[]
): { valid: boolean; errors: Record<string, LinkFieldErrors> } {
  const errors: Record<string, LinkFieldErrors> = {};
  let hasCompleteRow = false;

  for (const link of links) {
    const title = link.title.trim();
    const url = link.url.trim();
    const rowErrors: LinkFieldErrors = {};

    if (!title && !url) {
      continue;
    }

    if (!title) {
      rowErrors.title = 'Link title is required';
    }

    if (!url) {
      rowErrors.url = 'URL is required';
    } else if (!isValidUrl(url)) {
      rowErrors.url = 'Please enter a valid URL';
    }

    if (Object.keys(rowErrors).length === 0) {
      hasCompleteRow = true;
    } else {
      errors[link.id] = rowErrors;
    }
  }

  if (!hasCompleteRow) {
    const firstLink = links[0];
    if (firstLink && !errors[firstLink.id]) {
      const rowErrors: LinkFieldErrors = {};
      if (!firstLink.title.trim()) {
        rowErrors.title = 'Link title is required';
      }
      if (!firstLink.url.trim()) {
        rowErrors.url = 'URL is required';
      } else if (!isValidUrl(firstLink.url)) {
        rowErrors.url = 'Please enter a valid URL';
      }
      if (Object.keys(rowErrors).length > 0) {
        errors[firstLink.id] = rowErrors;
      }
    }
    return { valid: false, errors };
  }

  return { valid: true, errors };
}

const SubmitTaskModal: React.FC<SubmitTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialLinks = [],
  initialNotes = '',
}) => {
  const [submissionLinks, setSubmissionLinks] = useState<SubmissionLink[]>([
    { id: '1', title: '', url: '' },
  ]);
  const [notes, setNotes] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, LinkFieldErrors>>({});

  useEffect(() => {
    if (!isOpen) {
      setSubmitAttempted(false);
      setFieldErrors({});
      return;
    }

    if (initialLinks.length > 0) {
      setSubmissionLinks(initialLinks);
    } else {
      setSubmissionLinks([{ id: '1', title: '', url: '' }]);
    }

    setNotes(initialNotes || '');
  }, [isOpen, initialLinks, initialNotes]);

  const handleAddLink = () => {
    const newId = String(
      Math.max(...submissionLinks.map((l) => parseInt(l.id, 10) || 0), 0) + 1
    );
    setSubmissionLinks([...submissionLinks, { id: newId, title: '', url: '' }]);
  };

  const handleRemoveLink = (id: string) => {
    if (submissionLinks.length > 1) {
      setSubmissionLinks(submissionLinks.filter((link) => link.id !== id));
    }
  };

  const handleUpdateLink = (id: string, field: 'title' | 'url', value: string) => {
    setSubmissionLinks(
      submissionLinks.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
    if (submitAttempted) {
      const nextLinks = submissionLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      );
      const { errors } = validateSubmissionLinks(nextLinks);
      setFieldErrors(errors);
    }
  };

  const handleConfirmSubmission = () => {
    setSubmitAttempted(true);
    const { valid, errors } = validateSubmissionLinks(submissionLinks);
    setFieldErrors(errors);

    if (!valid) {
      return;
    }

    const validLinks = submissionLinks.filter(
      (link) => link.title.trim() && link.url.trim() && isValidUrl(link.url)
    );

    onSubmit(validLinks, notes);
  };

  const handleClose = () => {
    setSubmissionLinks([{ id: '1', title: '', url: '' }]);
    setNotes('');
    setSubmitAttempted(false);
    setFieldErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1F2432]">Submit Your Assignment</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={24} className="text-[#6F7689]" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2432]">
                Project Link
              </h3>
              <button
                type="button"
                onClick={handleAddLink}
                className="rounded-lg bg-[#6E56CF]/10 p-2 hover:bg-[#6E56CF]/20"
              >
                <span className="text-xl text-[#6E56CF]">+</span>
              </button>
            </div>

            <div className="space-y-3">
              {submissionLinks.map((link) => {
                const rowErrors = fieldErrors[link.id];

                return (
                  <div key={link.id} className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="e.g. Design Thinking Handbook"
                        value={link.title}
                        onChange={(e) => handleUpdateLink(link.id, 'title', e.target.value)}
                        className={`w-full rounded-xl border bg-[#F8FAFB] px-4 py-3 text-sm placeholder-[#A0AABC] focus:border-[#6E56CF] focus:outline-none ${
                          submitAttempted && rowErrors?.title
                            ? 'border-[#AF2F4D]'
                            : 'border-[#E6E9F2]'
                        }`}
                      />
                      {submitAttempted && rowErrors?.title && (
                        <p className="text-xs font-medium text-[#AF2F4D]">{rowErrors.title}</p>
                      )}
                      <div
                        className={`flex items-center gap-2 rounded-xl border bg-[#F8FAFB] px-4 py-3 ${
                          submitAttempted && rowErrors?.url
                            ? 'border-[#AF2F4D]'
                            : 'border-[#E6E9F2]'
                        }`}
                      >
                        <span className="text-[#667085]">🔗</span>
                        <input
                          type="url"
                          placeholder="https://www.figma.com/file/..."
                          value={link.url}
                          onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                          className="flex-1 bg-transparent text-sm placeholder-[#A0AABC] focus:outline-none"
                        />
                      </div>
                      {submitAttempted && rowErrors?.url && (
                        <p className="text-xs font-medium text-[#AF2F4D]">{rowErrors.url}</p>
                      )}
                    </div>
                    {submissionLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="mt-2 rounded-lg bg-red-50 p-2 hover:bg-red-100"
                      >
                        <X size={20} className="text-red-600" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-[#1F2432]">
              Notes for Your Mentor
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain your design decisions, specific areas you'd like feedback on, or any challenges you faced..."
              rows={4}
              className="mt-2 w-full rounded-xl border border-[#E6E9F2] bg-[#F8FAFB] px-4 py-3 text-sm placeholder-[#A0AABC] focus:border-[#6E56CF] focus:outline-none"
            />
          </div>
        </div>

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
            onClick={handleConfirmSubmission}
            className="rounded-xl bg-[#6E56CF] px-6 py-2.5 font-semibold text-white hover:bg-[#5E46BF]"
          >
            Confirm Submission ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitTaskModal;
