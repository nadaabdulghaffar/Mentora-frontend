import { useRef, useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import {
  extractErrorMessage,
  uploadTaskAttachment,
} from '../../../services/roadmapService';

export type CreateClassroomTaskFormValues = {
  title: string;
  description: string;
  deadline: string;
  attachmentUrl?: string;
};

type MentorNewTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (values: CreateClassroomTaskFormValues) => void;
  isPublishing?: boolean;
  initialData?: CreateClassroomTaskFormValues;
};

const labelClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A91A5]';
const inputClass =
  'w-full rounded-xl border border-[#E6E9F2] bg-[#F4F6FA] px-4 py-3 text-sm text-[#1F2432] outline-none transition placeholder:text-[#9AA1B1] focus:border-[#5E4BC5] focus:bg-white';

export default function MentorNewTaskModal({
  isOpen,
  onClose,
  onPublish,
  isPublishing = false,
  initialData,
}: MentorNewTaskModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        
        // If initialData.deadline has a time part, just take the YYYY-MM-DD
        const formattedDeadline = initialData.deadline 
          ? initialData.deadline.split('T')[0]
          : '';
        setDeadline(formattedDeadline);

        setAttachmentUrl(initialData.attachmentUrl || '');
        // Extract filename from URL or set generic name
        if (initialData.attachmentUrl) {
          const parts = initialData.attachmentUrl.split('/');
          setAttachmentName(parts[parts.length - 1] || 'Attached file');
        } else {
          setAttachmentName('');
        }
      } else {
        setTitle('');
        setDescription('');
        setDeadline('');
        setAttachmentUrl('');
        setAttachmentName('');
      }
      setUploadError(null);
      setSubmitAttempted(false);
    } else {
      setTitle('');
      setDescription('');
      setDeadline('');
      setAttachmentUrl('');
      setAttachmentName('');
      setUploadError(null);
      setSubmitAttempted(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setAttachmentUrl('');
    setAttachmentName('');
    setUploadError(null);
    setSubmitAttempted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const titleError = submitAttempted && !title.trim()
    ? 'Title is required.'
    : null;
  const descriptionError = submitAttempted && !description.trim()
    ? 'Description is required.'
    : null;
  const deadlineError = (() => {
    if (!submitAttempted) {
      return null;
    }

    if (!deadline) {
      return 'Deadline is required.';
    }

    const parsed = new Date(`${deadline}T23:59:59`);
    if (Number.isNaN(parsed.getTime())) {
      return 'Enter a valid deadline.';
    }

    if (parsed <= new Date()) {
      return 'Deadline must be in the future.';
    }

    return null;
  })();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadTaskAttachment(file);
      setAttachmentUrl(url);
      setAttachmentName(file.name);
    } catch (error) {
      setUploadError(extractErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = () => {
    setSubmitAttempted(true);

    if (titleError || descriptionError || deadlineError || isPublishing || uploading) {
      return;
    }

    onPublish({
      title: title.trim(),
      description: description.trim(),
      deadline,
      attachmentUrl: attachmentUrl.trim() || "", // Send empty string instead of undefined to clear it
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-labelledby="mentor-new-task-title"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#ECEFF6] px-6 py-5">
          <h2 id="mentor-new-task-title" className="text-xl font-bold text-[#1F2432]">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-[#6F7689] transition hover:bg-[#F2F4F8]"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[min(70vh,540px)] space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="mentor-new-task-title-input" className={labelClass}>
              Title
            </label>
            <input
              id="mentor-new-task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Heuristic Review"
              className={`${inputClass} ${titleError ? 'border-[#E4A4B0]' : ''}`}
            />
            {titleError ? (
              <p className="mt-1 text-xs text-[#AF2F4D]">{titleError}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="mentor-new-task-desc" className={labelClass}>
              Description
            </label>
            <textarea
              id="mentor-new-task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide assignment details..."
              rows={4}
              className={`${inputClass} min-h-[120px] resize-y ${descriptionError ? 'border-[#E4A4B0]' : ''}`}
            />
            {descriptionError ? (
              <p className="mt-1 text-xs text-[#AF2F4D]">{descriptionError}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="mentor-new-task-deadline" className={labelClass}>
              Deadline
            </label>
<input
  id="mentor-new-task-deadline"
  type="date"
  value={deadline}
  onChange={(e) => setDeadline(e.target.value)}
  className={`${inputClass} [color-scheme:light] ${
    deadlineError ? 'border-[#E4A4B0]' : ''
  }`}
/>
            {deadlineError ? (
              <p className="mt-1 text-xs text-[#AF2F4D]">{deadlineError}</p>
            ) : null}
          </div>

          <div className="rounded-xl border border-[#E6E9F2] bg-[#FCFCFE] p-4">
            <span className={labelClass}>Attachment (optional)</span>
            <p className="mb-3 text-xs text-[#667085]">
              Upload a reference file for mentees. You can publish without an attachment.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading || isPublishing}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isPublishing}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DDE2EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#5E4BC5] transition hover:bg-[#F4F0FF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload file'}
            </button>

            {attachmentName ? (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs font-medium text-[#0E7A5F]">
                  Attached: {attachmentName}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentUrl('');
                    setAttachmentName('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-xs font-semibold text-[#AF2F4D] hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : null}

            {uploadError ? (
              <p className="mt-2 text-xs text-[#AF2F4D]">{uploadError}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#ECEFF6] px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F4F6FA]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPublishing || uploading}
            onClick={handlePublish}
            className="rounded-xl bg-[#5E4BC5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F3DB0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing ? (initialData ? 'Saving...' : 'Publishing...') : (initialData ? 'Save Changes' : 'Publish Task')}
          </button>
        </div>
      </div>
    </div>
  );
}
