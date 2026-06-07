/**
 * ThreadModal Component
 * Modal for displaying thread details with comments
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, MessageCircle, Pencil, Trash2, Paperclip } from 'lucide-react';
import { Modal } from '../Modal';
import { CommentThread } from './CommentThread';
import type { ThreadComment } from '../../pages/community/types';
import { type PostAttachment } from '../Feed';

import {
  classroomFeedService,
  
} from "../../services/classroomFeedService";
import { ClassroomUserLink } from '../classroom/common/ClassroomUserLink';

interface ClassroomThread {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;

  likes: number;
  likedByMe?: boolean;

  commentCount?: number;

  canEdit?: boolean;
  canDelete?: boolean;

  comments?: ThreadComment[];

  authorRole?: string;

  attachments?: PostAttachment[];
}

const resolveClassroomAvatar = (url?: string | null, fullName?: string) => {
  const raw = (url ?? '').trim();
  if (raw) {
    const normalized = raw.replace(/\\/g, '/');
    if (/^https?:\/\//i.test(normalized)) {
      return normalized;
    }
    const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:5069/api').replace(/\/api\/?$/, '');
    return `${apiBase}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}`;
};

function modalOwnerCanEdit(
  uid: string | undefined,
  t: ClassroomThread,
  hasHandler: boolean
): boolean {
  if (!uid || t.authorId !== uid || !hasHandler) return false;
  return t.canEdit !== false;
}

function modalOwnerCanDelete(
  uid: string | undefined,
  t: ClassroomThread,
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
 * 
 */

interface ThreadModalProps {
  isOpen: boolean;
  onClose: () => void;

  thread: ClassroomThread;

  onCommentSubmit?: (
    content: string
  ) => void;

  onCommentReply?: (
    parentCommentId: string,
    content: string
  ) => void;



  onCommentDelete?: (
    commentId: string
  ) => void;

  onCommentEdit?: (
    commentId: string,
    content: string
  ) => void;

  onThreadLike?: (
    postId: string
  ) => void;

  onThreadEditRequest?: (
    thread: ClassroomThread
  ) => void;

  onThreadDelete?: (
    threadId: string
  ) => void;

  isLoadingComment?: boolean;

  currentUserId?: string;

  currentUserAvatar?: string;

  programId: number;

  currentUserRole?:
    | "admin"
    | "moderator"
    | "member";
}


export const ClassroomThreadModal: React.FC<ThreadModalProps> = ({
  isOpen,
  onClose,
  thread,
  onThreadLike,
  onThreadEditRequest,
  onThreadDelete,
  isLoadingComment = false,
  currentUserId = 'current-user',
  currentUserAvatar,
  programId ,
}
) => {
  const formatClassroomTimestamp = (timestamp: string): string => {
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return timestamp;
    }
    return parsed.toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const [commentInput, setCommentInput] = useState('');

const [localComments, setLocalComments] =
  useState<ThreadComment[]>(
    thread.comments || []
  );

  const getCommentsTotal = useCallback((comments: ThreadComment[]): number => {
    return comments.reduce((total, comment) => {
      const replies = comment.replies ?? [];
      return total + 1 + getCommentsTotal(replies);
    }, 0);
  }, []);

  const totalCommentsCount = getCommentsTotal(localComments);


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

useEffect(() => {

  if (isOpen) {

    loadComments();

  }

}, [
  isOpen,
  thread.id,
  currentUserId
]);



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



 const loadComments = async () => {

  try {

    const response =
      await classroomFeedService
        .getComments(
          programId,
          Number(thread.id)
        );

    const mappedComments =
      response.data.map(
        (comment: any) => ({
          id: String(
            comment.commentId
          ),

          authorId:
            comment.author.userId,

          authorName:
            comment.author.fullName,

          authorAvatar:
            resolveClassroomAvatar(
              comment.author.profilePictureUrl,
              comment.author.fullName
            ),

          content:
            comment.content,

          timestamp:
            comment.createdAt,

          likes:
            comment.likesCount,

          likedByMe:
            comment.likedByMe,

          replies: [],

          canEdit:
            comment.author.userId ===
            currentUserId,

          canDelete:
            comment.author.userId ===
            currentUserId,
        })
      );

    setLocalComments(
      mappedComments
    );

  } catch (error) {

    console.error(
      "Failed to fetch comments",
      error
    );

  }
};

const handleCommentSubmit =
  async () => {

    const trimmed =
      commentInput.trim();

    if (!trimmed) return;

    try {

      await classroomFeedService
        .createComment(
          programId,
          Number(thread.id),
          trimmed,
          null
        );

 await loadComments();

setCommentInput("");

      // نفس mapping الموجود في useEffect

      setCommentInput("");

    } catch (error) {

      console.error(
        "Failed to create comment",
        error
      );

    }
  };





const handleLocalEdit =
  async (
    commentId: string,
    content: string
  ) => {

    try {

      await classroomFeedService
        .updateComment(
          programId,
          Number(commentId),
          content
        );

      await loadComments();

    } catch (error) {

      console.error(
        "Failed to edit comment",
        error
      );

    }
  };




 
const handleLocalDelete =
  async (
    commentId: string
  ) => {

    try {

      await classroomFeedService
        .deleteComment(
          programId,
          Number(commentId)
        );

      await loadComments();

    } catch (error) {

      console.error(
        "Failed to delete comment",
        error
      );

    }
  };

  const handleDeleteThread =
  () => {

    closeThreadMenu();

    onThreadDelete?.(
      thread.id
    );

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

  

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {threadOwnerMenuPortal}
      <div className="w-full max-w-full max-h-[90vh] overflow-y-auto">
        {/* Thread Content */}
        <div className="mb-6">
          {/* Author Info */}
          <div className="mb-4 flex items-center gap-3">
            <img
              src={thread.authorAvatar}
              alt={thread.authorName}
              className="h-12 w-12 rounded-full object-cover"
              onError={(event) => {
                const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.authorName || 'User')}`;
                if (event.currentTarget.src !== fallback) {
                  event.currentTarget.src = fallback;
                }
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <ClassroomUserLink
                  userId={thread.authorId}
                  name={thread.authorName}
                  className="font-semibold text-gray-900"
                />
                {thread.authorRole && thread.authorRole !== 'member' && (
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                    {thread.authorRole}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatClassroomTimestamp(thread.timestamp)}</p>
            </div>
          </div>

          <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
            {thread.content?.trim() || 'No post content'}
          </div>

          {/* Attachment Image Preview */}
          {thread.attachments?.filter(a => a.type === 'image').map((att) => (
            <div key={att.id} className="mt-4">
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
            <div key={att.id} className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
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


          {/* Compact Engagement Bar */}
  <div className="mt-4 flex items-center justify-between border-t border-b border-gray-200 py-3 text-sm text-gray-600">
  <div className="flex items-center gap-5">

    <button
      onClick={() =>
        onThreadLike?.(
          thread.id
        )
      }
      className={`flex items-center gap-1.5 transition ${
        thread.likedByMe
          ? 'text-red-500'
          : 'text-gray-600 hover:text-red-500'
      }`}
    >
      <Heart
        size={16}
        fill={
          thread.likedByMe
            ? 'currentColor'
            : 'none'
        }
      />
      {thread.likes > 0 && <span>{thread.likes}</span>}
    </button>

    <button
      onClick={() => {
        const commentsSection =
          document.getElementById(
            'thread-comments'
          );

        commentsSection?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }}
      className="flex items-center gap-1.5 text-gray-600 transition hover:text-blue-600"
    >
      <MessageCircle size={16} />
      {totalCommentsCount > 0 && <span>{totalCommentsCount}</span>}
    </button>

  </div>
</div>
        </div>

        <hr className="my-6" />

        {/* Comments Section */}
        <div id="thread-comments">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
Comments{totalCommentsCount > 0 ? ` (${totalCommentsCount})` : ''}
            </h3>
          </div>

          {/* Comment Input */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <img
                src={resolveClassroomAvatar(currentUserAvatar, 'You')}
                alt="Your avatar"
                className="h-8 w-8 rounded-full object-cover"
                onError={(event) => {
                  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent('You')}`;
                  if (event.currentTarget.src !== fallback) {
                    event.currentTarget.src = fallback;
                  }
                }}
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
                  onEdit={handleLocalEdit}
onDelete={handleLocalDelete}
                  currentUserId={currentUserId}
                  variant="classroom"
                  showCommentLike={false}
                  showReplyAction={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ClassroomThreadModal;