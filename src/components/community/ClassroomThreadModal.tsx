/**
 * ThreadModal Component
 * Modal for displaying thread details with comments
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart,  MessageCircle,  MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { CommentThread } from './CommentThread';
import type { ThreadComment } from '../../pages/community/types';
import { formatTimestamp } from '../../pages/community/utils/threadUtils';

import {
  classroomFeedService,
  
} from "../../services/classroomFeedService";

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
}

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
  onCommentSubmit,
  onCommentReply,
  onCommentDelete,
  onCommentEdit,
  onThreadLike,
  onThreadEditRequest,
  onThreadDelete,
  isLoadingComment = false,
  currentUserId = 'current-user',
  programId ,
  
}
) => {
  const [commentInput, setCommentInput] = useState('');

const [localComments, setLocalComments] =
  useState<ThreadComment[]>(
    thread.comments || []
  );


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
            comment.author.profilePictureUrl ||

            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              comment.author.fullName
            )}`,

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
      <span>{thread.likes}</span>
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
      <span>{thread.commentCount}</span>
    </button>

  </div>
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
                  onReply={onCommentReply}
                 onEdit={handleLocalEdit}
onDelete={handleLocalDelete}
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

export default ClassroomThreadModal;