import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface SubmissionLink {
  id: string;
  title: string;
  url: string;
}

interface SubmitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (links: SubmissionLink[], notes: string) => void;
  taskTitle?: string;
}

const SubmitTaskModal: React.FC<SubmitTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskTitle = 'Task',
}) => {
  const [submissionLinks, setSubmissionLinks] = useState<SubmissionLink[]>([
    { id: '1', title: '', url: '' },
  ]);
  const [notes, setNotes] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const handleAddLink = () => {
    const newId = String(Math.max(...submissionLinks.map((l) => parseInt(l.id)), 0) + 1);
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
  };

  const handleConfirmSubmission = () => {
    onSubmit(submissionLinks, notes);
    resetForm();
    onClose();
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    setTimeout(() => {
      setIsSavingDraft(false);
      onClose();
    }, 500);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSubmissionLinks([{ id: '1', title: '', url: '' }]);
    setNotes('');
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
          {/* Project Links Section */}
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
              {submissionLinks.map((link) => (
                <div key={link.id} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Design Thinking Handbook"
                      value={link.title}
                      onChange={(e) => handleUpdateLink(link.id, 'title', e.target.value)}
                      className="w-full rounded-xl border border-[#E6E9F2] bg-[#F8FAFB] px-4 py-3 text-sm placeholder-[#A0AABC] focus:border-[#6E56CF] focus:outline-none"
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-[#E6E9F2] bg-[#F8FAFB] px-4 py-3">
                      <span className="text-[#667085]">🔗</span>
                      <input
                        type="url"
                        placeholder="https://www.figma.com/file/..."
                        value={link.url}
                        onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                        className="flex-1 bg-transparent text-sm placeholder-[#A0AABC] focus:outline-none"
                      />
                    </div>
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
              ))}
            </div>
          </div>

          {/* Notes Section */}
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
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="rounded-xl border-2 border-[#D5CCFF] bg-white px-6 py-2.5 font-semibold text-[#5B45BE] hover:bg-[#F5F3FF] disabled:opacity-60"
          >
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
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
