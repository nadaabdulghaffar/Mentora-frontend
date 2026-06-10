/**
 * PostCard Component
 * Reusable card component for displaying community posts/threads
 * Used in community feed for displaying discussion threads
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Link, Pencil, Trash2, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CommunityThread } from '../../pages/community/types';
import { formatTimestamp, truncateText } from '../../pages/community/utils/threadUtils';
import { buildCommunityPostShareUrl } from '../../pages/community/utils/shareUtils';
import ConfirmationModal from '../modals/ConfirmationModal';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { ClassroomUserLink } from '../classroom/common/ClassroomUserLink';

interface PostCardProps {
  thread: CommunityThread;
  onThreadClick: (thread: CommunityThread) => void;
  onLike?: (threadId: string) => void;
  onShare?: (threadId: string) => void;
  /** Legacy generic “more” (e.g. report) when owner menu is not shown */
  onMoreOptions?: (threadId: string) => void;
  /** Current user id — enables owner ⋯ Edit / Delete when it matches `thread.authorId` */
  currentUserId?: string;
  /** Opens the shared create/edit post modal prefilled with this thread */
  onThreadEditRequest?: (thread: CommunityThread) => void;
  onThreadDelete?: (threadId: string) => void;
  isCompact?: boolean;
}



function threadOwnerCanEdit(
  uid: string | undefined,
  t: CommunityThread,
  hasHandler: boolean
): boolean {
  if (
    !uid ||
    t.authorId !== uid ||
    !hasHandler
  )
    return false;

  return t.canEdit !== false;
}





function threadOwnerCanDelete(
  uid: string | undefined,
  t: CommunityThread,
  hasHandler: boolean
): boolean {
  if (
    !uid ||
    t.authorId !== uid ||
    !hasHandler
  )
    return false;

  return t.canDelete !== false;
}


/**
 * PostCard - Displays a single post/thread in a card format
 */
export const PostCard: React.FC<PostCardProps> = ({
  thread,
  onThreadClick,
  onLike,
  onShare,
  onMoreOptions,
  currentUserId,
  onThreadEditRequest,
  onThreadDelete,
  isCompact = false,
}) => {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuCoords(null);
  }, []);

  const showEdit = threadOwnerCanEdit(currentUserId, thread, Boolean(onThreadEditRequest));
  const showDelete = threadOwnerCanDelete(currentUserId, thread, Boolean(onThreadDelete));
  const showOwnerMenu = showEdit || showDelete;
  const showLegacyMore = Boolean(onMoreOptions) && !showOwnerMenu;

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

  const displayContent = useMemo(() => {
    return isCompact ? truncateText(thread.content, 120) : thread.content;
  }, [thread.content, isCompact]);

  const shareLink = useMemo(
    () => buildCommunityPostShareUrl(thread.id, thread.communityId),
    [thread.communityId, thread.id]
  );

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setShareOpen(false);
    } catch {
      // Keep the popup open if the clipboard permission is denied.
    }
  };

  const handleDeleteClick = () => {
    closeMenu();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onThreadDelete?.(thread.id);
  };

  const ownerMenuPortal =
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
              onThreadEditRequest?.(thread);
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
    <div className="overflow-visible rounded-xl border border-gray-100 bg-card transition hover:shadow-lg">
      {ownerMenuPortal}
      {/* Header */}
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          {/* Author Info */}
          <div className="flex flex-1 items-start gap-3">
            <ProfileAvatar
              pictureUrl={thread.authorProfilePicture}
              name={thread.authorName}
              alt={thread.authorName}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <ClassroomUserLink
                  userId={thread.authorId}
                  name={thread.authorName}
                  className="font-semibold text-gray-900 text-sm"
                />
                {thread.communityName && thread.communityId && (
                  <>
                    <span className="text-gray-400" aria-hidden>
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/community/${thread.communityId}`);
                      }}
                      className="text-sm font-medium text-gray-600 hover:text-blue-600"
                    >
                      {thread.communityName}
                    </button>
                  </>
                )}
                {thread.authorRole && thread.authorRole !== 'member' && (
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                    {thread.authorRole}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatTimestamp(thread.timestamp)}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {showOwnerMenu && (
              <button
                ref={menuTriggerRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openMenu();
                }}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Post actions"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <MoreHorizontal size={18} />
              </button>
            )}
            {showLegacyMore && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreOptions?.(thread.id);
                }}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="More options"
              >
                <MoreHorizontal size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="cursor-pointer px-4 py-3 sm:px-6" onClick={() => onThreadClick(thread)}>
        {thread.title && (
          <h3 className="mb-2 text-base font-semibold text-gray-900">{thread.title}</h3>
        )}
        <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{displayContent}</p>

        {/* Attachment Image Preview */}
        {thread.attachments?.filter(a => a.type === 'image').map((att) => (
          <div key={att.id} className="mt-4" onClick={(e) => e.stopPropagation()}>
            <a href={att.url} target="_blank" rel="noopener noreferrer">
              <img
                src={att.url}
                alt={att.name || "attachment"}
                className="max-h-[300px] w-full rounded-md object-contain bg-gray-50 border border-gray-100 cursor-pointer"
              />
            </a>
          </div>
        ))}

        {/* Attachment File Link */}
        {thread.attachments?.filter(a => a.type === 'file').map((att) => (
          <div key={att.id} className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3" onClick={(e) => e.stopPropagation()}>
            <Paperclip size={18} className="text-gray-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{att.name || 'Attachment'}</p>
            </div>
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              Open/Download
            </a>
          </div>
        ))}
      </div>

      {/* Footer - Compact Engagement Bar */}
      <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4 text-sm text-gray-600">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.(thread.id);
              }}
              className={`flex items-center gap-1.5 transition ${
                thread.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={16} fill={thread.isLiked ? 'currentColor' : 'none'} />
              <span>{thread.likes}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onThreadClick(thread);
              }}
              className="flex items-center gap-1.5 text-gray-600 transition hover:text-blue-600"
            >
              <MessageCircle size={16} />
              <span>{thread.commentCount}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareOpen((prev) => !prev);
                  onShare?.(thread.id);
                }}
                className="flex items-center gap-1.5 text-gray-600 transition hover:text-gray-800"
              >
                <Share2 size={16} />
              </button>

              {shareOpen ? (
                <div
                  className="absolute right-0 top-full z-30 mt-3 w-80 rounded-2xl border border-white/15 bg-white p-4 text-slate-900 shadow-2xl shadow-black/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm font-semibold text-[#1F2533]">Share post</p>
                  <p className="mt-1 text-xs text-[#6B7289]">Copy this post link and send it to anyone.</p>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D8DCE8] bg-[#F8F9FD] px-3 py-2">
                    <Link size={16} className="shrink-0 text-primary" />
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
                      onClick={handleCopyLink}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Post?"
        message="Delete this post? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
