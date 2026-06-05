import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Image, Paperclip, Smile } from 'lucide-react';
import { messagingService, isImageAttachment } from '../../../services/messagingService';

export type AddPostAttachment = {
  id: string;
  name: string;
  type: 'image' | 'file';
  sizeLabel?: string;
  url: string;
  // Optional original File object for upload
  file?: File;
};

type AddPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPost: (payload: { content: string; attachments: AddPostAttachment[] }) => void | Promise<void>;
  onUpdatePost?: (postId: string, payload: { content: string; attachments: AddPostAttachment[] }) => void | Promise<void>;
  authorAvatarUrl?: string;
  authorName?: string;
  /** When set, modal behaves as edit with prefilled content and attachments */
  editDraft?: { postId: string; content: string; attachments: AddPostAttachment[] } | null;
};

const AddPostModal = ({
  isOpen,
  onClose,
  onPost,
  onUpdatePost,
  authorAvatarUrl,
  authorName = 'You',
  editDraft = null,
}: AddPostModalProps) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<AddPostAttachment[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditMode = Boolean(editDraft?.postId);

  useEffect(() => {
    if (!isOpen) return;
    if (editDraft?.postId) {
      setContent(editDraft.content);
      setAttachments(editDraft.attachments);
    } else {
      setContent('');
      setAttachments([]);
    }
  }, [isOpen, editDraft?.postId, editDraft?.content, editDraft?.attachments]);

  const canPost = content.trim().length > 0;

  const attachmentSummary = useMemo(() => {
    if (attachments.length === 0) {
      return null;
    }

    return `${attachments.length} attachment${attachments.length > 1 ? 's' : ''}`;
  }, [attachments.length]);

  if (!isOpen) {
    return null;
  }

  const resolvedAvatar =
    authorAvatarUrl?.trim() ||
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(authorName)}`;

  const resetAndClose = () => {
    setContent('');
    setAttachments([]);
    onClose();
  };

  const handleAddAttachment = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const nextAttachments = selectedFiles.map((file, index) => ({
      id: `${type}-${file.name}-${Date.now()}-${index}`,
      name: file.name,
      type,
      sizeLabel: type === 'image' ? 'Image' : 'File',
      url: URL.createObjectURL(file),
      file,
    }));

    setAttachments((current) => [...current, ...nextAttachments]);
    event.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  const handlePost = async () => {
    if (!canPost) {
      return;
    }

    // Upload files first, then send only persistent URLs to post creation.
    const resolvedAttachments: AddPostAttachment[] = [];
    try {
      const uploads = await Promise.all(
        attachments.map(async (att) => {
          if (att.file) {
            const upl = await messagingService.uploadAttachment(att.file);
            if (!upl.fileUrl?.trim()) {
              throw new Error('Missing uploaded file URL');
            }
            const isImage = isImageAttachment(upl.contentType, upl.fileName);
            return {
              id: att.id,
              name: upl.fileName || att.name,
              type: isImage ? 'image' : 'file',
              sizeLabel: att.sizeLabel,
              url: upl.fileUrl,
            } as AddPostAttachment;
          }
          if (!att.url?.trim() || att.url.startsWith('blob:')) {
            throw new Error('Attachment URL is not persistent');
          }
          return {
            ...att,
            name: att.name || 'Attachment',
            type: att.type === 'image' ? 'image' : 'file',
          };
        })
      );

      resolvedAttachments.push(...uploads);
    } catch (err) {
      console.error('Failed to upload attachments', err);
      return;
    }

    const payload = { content: content.trim(), attachments: resolvedAttachments };
    if (isEditMode && editDraft && onUpdatePost) {
      await onUpdatePost(editDraft.postId, payload);
    } else {
      await onPost(payload);
    }
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A8094]">Program Feed</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-[#1F2432]">
              {isEditMode ? 'Edit post' : 'Add a Post'}
            </h2>
            <p className="mt-1 text-sm text-[#6F7689]">
              {isEditMode
                ? 'Update your post for the atelier.'
                : 'Share an update, question, or resource with the atelier.'}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg p-1 text-[#6F7689] hover:bg-gray-100"
            aria-label="Close add post modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-start gap-4 rounded-2xl border border-[#E6E9F2] bg-[#FCFCFE] p-4">
            <img
              src={resolvedAvatar}
              alt="Your avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1 space-y-3">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Share a thought or ask the atelier..."
                rows={6}
                className="min-h-[160px] w-full resize-none rounded-2xl border border-[#E6E9F2] bg-white px-4 py-3 text-sm text-[#1F2432] outline-none placeholder:text-[#9AA1B1] focus:border-[#5E4BC5]"
              />
              {attachmentSummary && (
                <p className="text-xs font-medium text-[#6F7689]">{attachmentSummary}</p>
              )}
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#1F2432]">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 rounded-full border border-[#DDE2EF] bg-[#F8FAFE] px-3 py-1.5 text-sm text-[#4A546A]"
                  >
                    <span className="font-medium">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="text-[#7A8094] hover:text-[#1F2432]"
                      aria-label={`Remove ${attachment.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ECEFF6] pt-4">
            <div className="flex items-center gap-2 text-[#5B647A]">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-[#F2F4F8]"
                aria-label="Add image attachment"
              >
                <Image size={17} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-[#F2F4F8]"
                aria-label="Add file attachment"
              >
                <Paperclip size={17} />
              </button>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-[#F2F4F8]"
                aria-label="Add emoji"
              >
                <Smile size={17} />
              </button>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handleAddAttachment(event, 'image')}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => handleAddAttachment(event, 'file')}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="h-11 rounded-xl border border-[#D6DCE8] px-5 text-sm font-semibold text-[#1F2432] hover:bg-[#F8FAFE]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePost}
                disabled={!canPost}
                className="h-11 rounded-xl bg-[#5E4BC5] px-5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEditMode ? 'Save changes' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;
