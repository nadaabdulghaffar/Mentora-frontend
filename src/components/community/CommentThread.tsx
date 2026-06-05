/**
 * CommentThread Component
 * Displays a single comment with nested replies
 * Reusable for both community and classroom contexts
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Reply as ReplyIcon, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import type { ThreadComment } from '../../pages/community/types';
import { formatTimestamp, validateCommentContent } from '../../pages/community/utils/threadUtils';
import { ProfileAvatar } from '../profile/ProfileAvatar';

interface CommentThreadProps {
  comment: ThreadComment;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  depth?: number;
  variant?: 'community' | 'classroom';
  showCommentLike?: boolean;
  showReplyAction?: boolean;
}

function commentAllowsEdit(currentUserId: string | undefined, c: ThreadComment): boolean {
  if (!currentUserId || c.authorId !== currentUserId) return false;
  return c.canEdit !== false;
}

function commentAllowsDelete(currentUserId: string | undefined, c: ThreadComment): boolean {
  if (!currentUserId || c.authorId !== currentUserId) return false;
  return c.canDelete !== false;
}

/**
 * CommentThread - Displays a single comment with optional replies
 * Features:
 * - Author info with role badge
 * - Comment content
 * - Like counter
 * - Reply button and nested replies
 * - ⋯ menu with Edit / Delete for the signed-in author when allowed
 * - Nesting depth capped for readability
 */
export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onReply,
  onLike,
  onEdit,
  onDelete,
  currentUserId,
  depth = 0,
  variant = 'community',
  showCommentLike = true,
  showReplyAction = true,
}) => {
  const isCommunity = variant === 'community';

  const formatCommentTimestamp = (timestamp: string): string => {
    if (variant !== 'classroom') {
      return formatTimestamp(timestamp);
    }

    const parsed = new Date(timestamp);

    if (Number.isNaN(parsed.getTime())) {
      return timestamp;
    }

    return parsed.toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes);
  const [localIsLiked, setLocalIsLiked] = useState(!!comment.isLiked);
  const [localReplies, setLocalReplies] = useState<ThreadComment[]>(comment.replies ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.content);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuCoords(null);
  }, []);

  useEffect(() => {
    setLocalLikes(comment.likes);
    setLocalIsLiked(!!comment.isLiked);
    setLocalReplies(comment.replies ?? []);
  }, [comment.id, comment.likes, comment.isLiked, comment.replies]);

  useEffect(() => {
    if (!isEditing) setEditDraft(comment.content);
  }, [comment.content, comment.id, isEditing]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuTriggerRef.current?.contains(t) || menuPanelRef.current?.contains(t)) return;
      closeMenu();
    };

    const onScroll = () => closeMenu();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  const maxDepth = 3;
  const canNest = depth < maxDepth;

  const showEdit = Boolean(onEdit && commentAllowsEdit(currentUserId, comment));
  const showDelete = Boolean(onDelete && commentAllowsDelete(currentUserId, comment));
  const showOverflowMenu = variant === 'community' && (showEdit || showDelete) && !isEditing;

  const openMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }
    const el = menuTriggerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const width = 144;
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8));
      const top = r.bottom + 4;
      setMenuCoords({ top, left });
    }
    setMenuOpen(true);
  };

  const handleReplySubmit = () => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    const uid = currentUserId ?? 'current-user';
    const newReply: ThreadComment = {
      id: `reply-${Date.now()}`,
      authorId: uid,
      authorName: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
      authorRole: 'member',
      content: trimmed,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
      canDelete: true,
      canEdit: true,
    };

    setLocalReplies((prev) => [...prev, newReply]);
    setShowReplies(true);
    onReply?.(comment.id, trimmed);
    setReplyContent('');
    setShowReplyInput(false);
  };

  const handleSaveEdit = () => {
    const trimmed = editDraft.trim();
    const { isValid, isEmpty } = validateCommentContent(trimmed);
    if (!isValid || isEmpty) return;
    onEdit?.(comment.id, trimmed);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    closeMenu();
    const subtree =
      localReplies.length > 0 || (comment.replies && comment.replies.length > 0);
    const msg = subtree
      ? 'Delete this comment and all replies under it? This cannot be undone.'
      : 'Delete this comment? This cannot be undone.';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;
    onDelete?.(comment.id);
  };

  const marginLeft = depth * 12;

  const overflowMenu =
    menuOpen &&
    menuCoords &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={menuPanelRef}
        role="menu"
        className="fixed z-[200] w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        style={{ top: menuCoords.top, left: menuCoords.left }}
      >
        {showEdit && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              closeMenu();
              setEditDraft(comment.content);
              setIsEditing(true);
            }}
          >
            <Pencil size={14} className="shrink-0 text-gray-500" />
            Edit
          </button>
        )}
        {showDelete && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
            onClick={handleDeleteClick}
          >
            <Trash2 size={14} className="shrink-0" />
            Delete
          </button>
        )}
      </div>,
      document.body
    );

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="space-y-3">
      {overflowMenu}
      <div className="flex gap-3">
        <ProfileAvatar
          pictureUrl={comment.authorProfilePicture}
          name={comment.authorName}
          alt={comment.authorName}
          className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
          onError={(event) => {
            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName || 'User')}`;
            if (event.currentTarget.src !== fallback) {
              event.currentTarget.src = fallback;
            }
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{comment.authorName}</span>
            {comment.authorRole && comment.authorRole !== 'member' && (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  comment.authorRole === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : comment.authorRole === 'author'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                {comment.authorRole}
              </span>
            )}
            <span className="text-xs text-gray-500">{formatCommentTimestamp(comment.timestamp)}</span>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white"
                rows={3}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!validateCommentContent(editDraft).isValid}
                  className="rounded px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditDraft(comment.content);
                  }}
                  className="rounded px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {comment.content}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {!isCommunity && (
              <button
                type="button"
                onClick={() => {
                  setLocalIsLiked((prevLiked) => {
                    setLocalLikes((prevLikes) =>
                      prevLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1
                    );
                    return !prevLiked;
                  });
                  onLike?.(comment.id);
                }}
                className={`flex items-center gap-1 text-xs font-medium transition ${
                  localIsLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart size={14} fill={localIsLiked ? 'currentColor' : 'none'} />
                {localLikes > 0 && <span>{localLikes}</span>}
              </button>
            )}

            <div className="inline-flex items-center gap-0.5">
              {!isCommunity && canNest && (
                <button
                  type="button"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  <ReplyIcon size={14} />
                  Reply
                </button>
              )}
              {showOverflowMenu && (
                <button
                  ref={menuTriggerRef}
                  type="button"
                  onClick={openMenu}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Comment actions"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                >
                  <MoreHorizontal size={18} />
                </button>
              )}
            </div>
          </div>

          {!isCommunity && showReplyInput && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleReplySubmit();
                  }
                }}
                placeholder="Write a reply..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:bg-white"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                  className="rounded px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyContent('');
                  }}
                  className="rounded px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!isCommunity && (localReplies.length > 0 || comment.replies?.length) && (
            <div className="mt-3">
              {!showReplies ? (
                <button
                  type="button"
                  onClick={() => setShowReplies(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  View {localReplies.length} {localReplies.length === 1 ? 'reply' : 'replies'}
                </button>
              ) : (
                <div className="space-y-3 border-l-2 border-gray-200 pl-3">
                  {localReplies.map((reply) => (
                    <CommentThread
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onLike={onLike}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      currentUserId={currentUserId}
                      depth={depth + 1}
                      variant={variant}
                      showCommentLike={showCommentLike}
                      showReplyAction={showReplyAction}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowReplies(false)}
                    className="text-xs font-medium text-gray-600 hover:text-gray-800 transition"
                  >
                    Hide replies
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
