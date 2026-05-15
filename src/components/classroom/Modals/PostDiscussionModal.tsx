import React, { useState } from 'react';
import { X, Image as ImageIcon, FileText } from 'lucide-react';

interface PostDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, attachments?: File[]) => void;
  classroomName?: string;
}

const PostDiscussionModal: React.FC<PostDiscussionModalProps> = ({
  isOpen,
  onClose,
  onPost,
  classroomName = 'Classroom',
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const handleAddAttachment = (type: 'image' | 'document', files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostDiscussion = () => {
    if (content.trim()) {
      setIsPosting(true);
      setTimeout(() => {
        onPost(content, attachments);
        resetForm();
        onClose();
      }, 500);
    }
  };

  const resetForm = () => {
    setContent('');
    setAttachments([]);
    setIsPosting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2432]">Start a Discussion</h2>
            <p className="mt-1 text-sm text-[#6F7689]">Share your thoughts with the {classroomName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={24} className="text-[#6F7689]" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Discussion Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or engage with the community..."
              rows={6}
              className="w-full rounded-xl border border-[#E6E9F2] bg-[#F8FAFB] px-4 py-3 text-sm placeholder-[#A0AABC] focus:border-[#6E56CF] focus:outline-none"
            />
          </div>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[#1F2432]">Attachments ({attachments.length})</h3>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-[#E6E9F2] bg-[#F8FAFB] px-3 py-2"
                  >
                    <span className="text-xs font-medium text-[#5E667D]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="rounded hover:bg-gray-200"
                    >
                      <X size={16} className="text-[#667085]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachment Options */}
          <div className="flex gap-3 border-t border-[#E6E9F2] pt-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F8FAFB]">
              <ImageIcon size={18} className="text-[#6E56CF]" />
              <span className="text-sm font-medium text-[#6E56CF]">Add Image</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAddAttachment('image', e.target.files)}
                className="hidden"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F8FAFB]">
              <FileText size={18} className="text-[#6E56CF]" />
              <span className="text-sm font-medium text-[#6E56CF]">Add Document</span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleAddAttachment('document', e.target.files)}
                className="hidden"
              />
            </label>
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
            onClick={handlePostDiscussion}
            disabled={isPosting || !content.trim()}
            className="rounded-xl bg-[#6E56CF] px-6 py-2.5 font-semibold text-white hover:bg-[#5E46BF] disabled:opacity-60"
          >
            {isPosting ? 'Posting...' : 'Post Discussion'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDiscussionModal;
