/**
 * ThreadModal Component
 * Modal for displaying thread details with comments
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Share2, Bookmark, MessageCircle, Link, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { CommentThread } from './CommentThread';
import type { CommunityThread, ThreadComment } from '../../pages/community/types';
import { formatTimestamp } from '../../pages/community/utils/threadUtils';

interface ThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: CommunityThread;
  onCommentSubmit?: (content: string) => void;
  onCommentReply?: (parentCommentId: string, content: string) => void;
  onCommentLike?: (commentId: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onCommentEdit?: (commentId: string, content: string) => void;
  onThreadLike?: () => void;
  onThreadShare?: () => void;
  onThreadSave?: () => void;
  /** Opens the same create/edit post modal (parent) prefilled with this thread */
  onThreadEditRequest?: (thread: CommunityThread) => void;
  onThreadDelete?: (threadId: string) => void;
  isLoadingComment?: boolean;
  currentUserId?: string;
  currentUserRole?: 'admin' | 'moderator' | 'member';
}

function modalOwnerCanEdit(
  uid: string | undefined,
  t: CommunityThread,
  hasHandler: boolean
): boolean {
  if (!uid || t.authorId !== uid || !hasHandler) return false;
  return t.canEdit !== false;
}

function modalOwnerCanDelete(
  uid: string | undefined,
  t: CommunityThread,
  hasHandler: boolean
): boolean {
  if (!uid || t.authorId !== uid || !hasHandler) return false;
  return t.canDelete !== false;
}

/**
 * ThreadModal - Full-screen modal for viewing thread details
 * Features:
 * - Thread content and author info
 * - Engagement metrics
 * - Comments section with nested replies
 * - Comment input for adding new comments
 * - Like, share, and save actions
 * - Edit and delete capabilities based on permissions
 */
export const ThreadModal: React.FC<ThreadModalProps> = ({
  isOpen,
  onClose,
  thread,
  onCommentSubmit,
  onCommentReply,
  onCommentLike,
  onCommentDelete,
  onCommentEdit,
  onThreadLike,
  onThreadShare,
  onThreadSave,
  onThreadEditRequest,
  onThreadDelete,
  isLoadingComment = false,
  currentUserId = 'current-user',
  currentUserRole = 'member',
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [localComments, setLocalComments] = useState<ThreadComment[]>(thread.comments);
  const [shareOpen, setShareOpen] = useState(false);

  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const [threadMenuCoords, setThreadMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const threadMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const threadMenuPanelRef = useRef<HTMLDivElement>(null);

  const closeThreadMenu = useCallback(() => {
    setThreadMenuOpen(false);
    setThreadMenuCoords(null);
  }, []);

  const showThreadEdit = modalOwnerCanEdit(currentUserId, thread, Boolean(onThreadEditRequest));
  const showThreadDelete = modalOwnerCanDelete(currentUserId, thread, Boolean(onThreadDelete));
  const showThreadOwnerMenu = showThreadEdit || showThreadDelete;

  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const path = thread.communityId ? `/community/${thread.communityId}` : window.location.pathname;
    return `${window.location.origin}${path}?thread=${thread.id}`;
  }, [thread.communityId, thread.id]);

  // Keep list in sync when parent updates thread (edit/delete/reply from useThreads)
  useEffect(() => {
    setLocalComments(thread.comments);
  }, [thread]);

  useEffect(() => {
    if (!isOpen) setShareOpen(false);
  }, [isOpen, thread.id]);

  useEffect(() => {
    if (!isOpen) closeThreadMenu();
  }, [isOpen, thread.id, closeThreadMenu]);

  useEffect(() => {
    if (!threadMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (threadMenuTriggerRef.current?.contains(t) || threadMenuPanelRef.current?.contains(t)) return;
      closeThreadMenu();
    };
    const onScroll = () => closeThreadMenu();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeThreadMenu();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [threadMenuOpen, closeThreadMenu]);

  const openThreadMenu = () => {
    if (threadMenuOpen) {
      closeThreadMenu();
      return;
    }
    const el = threadMenuTriggerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const width = 144;
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8));
      const top = r.bottom + 4;
      setThreadMenuCoords({ top, left });
    }
    setThreadMenuOpen(true);
  };

  const handleCommentSubmit = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    const newComment: ThreadComment = {
      id: `comment-${Date.now()}`,
      authorId: currentUserId,
      authorName: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
      authorRole: currentUserRole,
      content: trimmed,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
      canDelete: true,
      canEdit: true,
    };

    setLocalComments((prev) => [newComment, ...prev]);
    onCommentSubmit?.(trimmed);
    setCommentInput('');
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareOpen(false);
    } catch {
      // Clipboard denied — keep dialog open
    }
  };

  const handleDeleteThread = () => {
    closeThreadMenu();
    if (typeof window !== 'undefined' && !window.confirm('Delete this post? This cannot be undone.')) {
      return;
    }
    onThreadDelete?.(thread.id);
  };

  const threadOwnerMenuPortal =
    threadMenuOpen &&
    threadMenuCoords &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={threadMenuPanelRef}
        role="menu"
        className="fixed z-[200] w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        style={{ top: threadMenuCoords.top, left: threadMenuCoords.left }}
      >
        {showThreadEdit && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              closeThreadMenu();
              onThreadEditRequest?.(thread);
            }}
          >
            <Pencil size={14} className="shrink-0 text-gray-500" />
            Edit
          </button>
        )}
        {showThreadDelete && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
            onClick={handleDeleteThread}
          >
            <Trash2 size={14} className="shrink-0" />
            Delete
          </button>
        )}
      </div>,
      document.body
    );

  const shareDialog =
    shareOpen &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        role="presentation"
        onClick={() => setShareOpen(false)}
      >
        <div
          role="dialog"
          aria-labelledby="thread-share-title"
          className="w-full max-w-md rounded-2xl border border-white/15 bg-white p-4 text-slate-900 shadow-2xl shadow-black/20"
          onClick={(e) => e.stopPropagation()}
        >
          <p id="thread-share-title" className="text-sm font-semibold text-[#1F2533]">
            Share post
          </p>
          <p className="mt-1 text-xs text-[#6B7289]">Copy this post link and send it to anyone.</p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D8DCE8] bg-[#F8F9FD] px-3 py-2">
            <Link size={16} className="shrink-0 text-primary" aria-hidden />
            <input
              readOnly
              value={shareLink}
              className="min-w-0 flex-1 bg-transparent text-xs text-[#1F2533] outline-none"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShareOpen(false)}
              className="rounded-xl border border-[#D8DCE8] px-4 py-2 text-sm font-semibold text-[#6B7289] transition hover:bg-[#F8F9FD]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {shareDialog}
      {threadOwnerMenuPortal}
      <div className="w-full max-w-full max-h-[90vh] overflow-y-auto">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1">
          {showThreadOwnerMenu && (
            <button
              ref={threadMenuTriggerRef}
              type="button"
              onClick={openThreadMenu}
              aria-expanded={threadMenuOpen}
              aria-haspopup="menu"
              aria-label="Post actions"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <MoreHorizontal size={22} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Thread Content */}
        <div className="mb-6">
          {/* Author Info */}
          <div className="mb-4 flex items-center gap-3">
            <img
              src={thread.authorAvatar}
              alt={thread.authorName}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{thread.authorName}</p>
                {thread.authorRole && thread.authorRole !== 'member' && (
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                    {thread.authorRole}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatTimestamp(thread.timestamp)}</p>
            </div>
          </div>

          {/* Thread Title and Content */}
          <>
            {thread.title && (
              <h2 className="mb-3 text-xl font-bold text-gray-900">{thread.title}</h2>
            )}
            <p className="whitespace-pre-wrap text-base text-gray-700 leading-relaxed">{thread.content}</p>
          </>

          {/* Category */}
          {thread.category && (
            <div className="mt-4">
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {thread.category}
              </span>
            </div>
          )}

          {/* Compact Engagement Bar */}
          <div className="mt-4 flex items-center justify-between border-t border-b border-gray-200 py-3 text-sm text-gray-600">
            <div className="flex items-center gap-5">
              <button
                onClick={onThreadLike}
                className={`flex items-center gap-1.5 transition ${
                  thread.isLiked
                    ? 'text-red-500'
                    : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart size={16} fill={thread.isLiked ? 'currentColor' : 'none'} />
                <span>{thread.likes}</span>
              </button>
              <button
                onClick={() => {
                  const commentsSection = document.getElementById('thread-comments');
                  commentsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-1.5 text-gray-600 transition hover:text-blue-600"
              >
                <MessageCircle size={16} />
                <span>{thread.commentCount}</span>
              </button>
              <button
                onClick={onThreadSave}
                className={`flex items-center gap-1.5 transition ${
                  thread.isSaved
                    ? 'text-blue-500'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Bookmark size={16} fill={thread.isSaved ? 'currentColor' : 'none'} />
                <span>Save</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShareOpen(true);
                onThreadShare?.();
              }}
              className="rounded-full p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Share thread"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <hr className="my-6" />

        {/* Comments Section */}
        <div id="thread-comments">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Comments ({localComments.length})
            </h3>
          </div>

          {/* Comment Input */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser"
                alt="Your avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">You</p>
              </div>
            </div>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleCommentSubmit();
                }
              }}
              placeholder="Add a comment..."
              disabled={isLoadingComment}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none transition focus:border-blue-400"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleCommentSubmit}
                disabled={!commentInput.trim() || isLoadingComment}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>

          {/* Comments List */}
          {localComments.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-600">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localComments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  onLike={onCommentLike}
                  onReply={onCommentReply}
                  onEdit={onCommentEdit}
                  onDelete={onCommentDelete}
                  currentUserId={currentUserId}
                  variant="community"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
