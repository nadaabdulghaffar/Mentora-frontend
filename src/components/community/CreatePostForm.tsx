/**
 * CreatePostForm Component
 * Reusable form for creating new community posts/threads
 */

import React, { useEffect, useState } from 'react';
import { Image, Paperclip, X } from 'lucide-react';
import type { CreateThreadPayload, ThreadAttachment } from '../../pages/community/types';
import { validateThreadContent } from '../../pages/community/utils/threadUtils';

interface CreatePostFormProps {
  onSubmit: (payload: CreateThreadPayload) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  authorAvatar: string;
  authorName: string;
  /** Change when switching new post vs edit, or between threads — resets fields from initial props */
  formKey?: string;
  initialContent?: string;
  initialTitle?: string;
  initialAttachments?: ThreadAttachment[];
  showTitleField?: boolean;
  variant?: 'create' | 'edit';
}

/**
 * CreatePostForm - Form for creating new posts/threads
 * Features:
 * - Rich text input for post content
 * - Category selection
 * - File attachment preview
 * - Character counter
 * - Real-time validation
 * - Loading state
 * - Cancel and submit buttons
 */
export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  authorAvatar,
  authorName,
  formKey = 'new',
  initialContent = '',
  initialTitle = '',
  initialAttachments,
  showTitleField = false,
  variant = 'create',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<ThreadAttachment[]>(() => initialAttachments ?? []);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    const nextAttachments = initialAttachments ?? [];
    setAttachments(nextAttachments);
    const next: Record<string, string> = {};
    nextAttachments.forEach((a) => {
      if (a.type === 'image') next[a.id] = a.url;
    });
    setPreviewUrls(next);
  }, [formKey, initialContent, initialTitle, initialAttachments]);

  const validation = validateThreadContent(content);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const attachment: ThreadAttachment = {
          id: `att-${Date.now()}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url,
          name: file.name,
          mimeType: file.type,
        };

        setAttachments((prev) => [...prev, attachment]);
        if (attachment.type === 'image') {
          setPreviewUrls((prev) => ({
            ...prev,
            [attachment.id]: url,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    setPreviewUrls((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[attachmentId];
      return newPreviews;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid) {
      return;
    }

    onSubmit({
      content: content.trim(),
      ...(showTitleField ? { title: title.trim() } : {}),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setTitle('');
    setContent('');
    setAttachments([]);
    setPreviewUrls({});
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <img
          src={authorAvatar}
          alt={authorName}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">{authorName}</p>
          <p className="text-sm text-gray-500">Sharing knowledge with the community</p>
        </div>
      </div>

      {showTitleField && (
        <div className="mb-4">
          <label htmlFor="create-post-title" className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="create-post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Discussion title"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Content Textarea */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, ask a question, or start a discussion..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:bg-white"
          rows={5}
          disabled={isLoading}
        />
        <div className="mt-2 text-xs text-gray-500">
          {validation.characterCount} / 5000 characters
          {validation.isTooLong && (
            <span className="ml-2 text-red-600 font-medium">Content too long</span>
          )}
        </div>
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Attachments</label>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
              >
                {attachment.type === 'image' && previewUrls[attachment.id] ? (
                  <img
                    src={previewUrls[attachment.id]}
                    alt={attachment.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                ) : (
                  <Paperclip size={16} className="text-gray-600" />
                )}
                <div className="flex-1 ml-2 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {attachment.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-200 transition"
                  aria-label="Remove attachment"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* File Upload Buttons */}
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
            <Image size={16} />
            <span className="hidden sm:inline">Image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
            <Paperclip size={16} />
            <span className="hidden sm:inline">File</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!validation.isValid || isLoading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (variant === 'edit' ? 'Saving...' : 'Posting...') : variant === 'edit' ? 'Save changes' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
};
