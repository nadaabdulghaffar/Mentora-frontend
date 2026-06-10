/**
 * CommentThread Component
 * Displays a single comment with nested replies
 * Reusable for both community and classroom contexts
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import type { ThreadComment } from '../../pages/community/types';
import { formatTimestamp, validateCommentContent } from '../../pages/community/utils/threadUtils';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { ClassroomUserLink } from '../classroom/common/ClassroomUserLink';
import ConfirmationModal from '../modals/ConfirmationModal';

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
  onEdit,
  onDelete,
  currentUserId,
  depth = 0,
  variant = 'community',
}) => {
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

  const [localReplies, setLocalReplies] = useState<ThreadComment[]>(comment.replies ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.content);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuCoords(null);
  }, []);

  useEffect(() => {
    setLocalReplies(comment.replies ?? []);
  }, [comment.id, comment.replies]);

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



  const showEdit = Boolean(onEdit && commentAllowsEdit(currentUserId, comment));
  const showDelete = Boolean(onDelete && commentAllowsDelete(currentUserId, comment));
  const showOverflowMenu = (showEdit || showDelete) && !isEditing;

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



  const handleSaveEdit = () => {
    const trimmed = editDraft.trim();
    const { isValid, isEmpty } = validateCommentContent(trimmed);
    if (!isValid || isEmpty) return;
    onEdit?.(comment.id, trimmed);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    closeMenu();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(comment.id);
    setShowDeleteConfirm(false);
  };

  const hasSubtree = localReplies.length > 0 || (comment.replies && comment.replies.length > 0);
  const deleteMessage = hasSubtree
    ? 'Delete this comment and all replies under it? This cannot be undone.'
    : 'Delete this comment? This cannot be undone.';

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <ClassroomUserLink
                userId={comment.authorId}
                name={comment.authorName}
                className="font-semibold text-gray-900 text-sm truncate"
              />
              {comment.authorRole && comment.authorRole !== 'member' && (
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize shrink-0 ${
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
              <span className="text-xs text-gray-500 shrink-0">{formatCommentTimestamp(comment.timestamp)}</span>
            </div>

            {showOverflowMenu && (
              <button
                ref={menuTriggerRef}
                type="button"
                onClick={openMenu}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Comment actions"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-800 -mr-2"
              >
                <MoreHorizontal size={18} />
              </button>
            )}
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




        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Comment?"
        message={deleteMessage}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
