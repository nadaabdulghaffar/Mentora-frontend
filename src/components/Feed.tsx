import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Reply as ReplyIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { validateCommentContent, validateThreadContent } from '../pages/community/utils/threadUtils';
import { ClassroomUserLink } from './classroom/common/ClassroomUserLink';

// Types
export interface PostAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name?: string;
}

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: FeedComment[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface FeedPostProps {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  attachments?: PostAttachment[];
  likes: number;
  commentCount?: number;
  likedByMe: boolean;
  comments: FeedComment[];
  variant: 'classroom' | 'community';


  /** Classroom: owner can edit/delete post when handlers are passed */
  currentUserId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onPostUpdate?: (postId: string, content: string) => void;
  /** When set (e.g. classroom), Edit opens parent modal instead of inline editing */
  onRequestPostEdit?: (postId: string) => void;
  onPostDelete?: (postId: string) => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onReply?: (commentId: string) => void;
  onViewAllComments?: () => void;

    onLoadComments?: (
  postId: string
) => Promise<void>;
}

function updateFeedCommentContent(
  comments: FeedComment[],
  commentId: string,
  content: string
): FeedComment[] {
  return comments.map((c) => {
    if (c.id === commentId) return { ...c, content };
    if (c.replies?.length) {
      return { ...c, replies: updateFeedCommentContent(c.replies, commentId, content) };
    }
    return c;
  });
}

function removeFeedComment(comments: FeedComment[], commentId: string): FeedComment[] {
  const filtered = comments.filter((c) => c.id !== commentId);
  if (filtered.length !== comments.length) return filtered;
  return comments.map((c) =>
    c.replies?.length ? { ...c, replies: removeFeedComment(c.replies, commentId) } : c
  );
}

function addFeedReply(comments: FeedComment[], parentId: string, reply: FeedComment): FeedComment[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...(c.replies ?? []), reply] };
    }
    if (c.replies?.length) {
      return { ...c, replies: addFeedReply(c.replies, parentId, reply) };
    }
    return c;
  });
}

function feedCommentAllowsEdit(uid: string, c: FeedComment): boolean {
  if (c.authorId !== uid) return false;
  return c.canEdit !== false;
}

function feedCommentAllowsDelete(uid: string, c: FeedComment): boolean {
  if (c.authorId !== uid) return false;
  return c.canDelete !== false;
}

function buildAvatarFallback(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}`;
}

function formatAbsoluteTimestamp(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

interface ClassroomCommentBlockProps {
  comment: FeedComment;
  currentUserId: string;
  onAddReply: (parentId: string, reply: FeedComment) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  depth?: number;
}

const ClassroomCommentBlock: React.FC<ClassroomCommentBlockProps> = ({
  comment,
  currentUserId,
  onAddReply,
  onEditComment,
  onDeleteComment,
  onReply,
  depth = 0,
}) => {
  const replies = comment.replies ?? [];
  const formattedCommentTimestamp = formatAbsoluteTimestamp(comment.timestamp);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [commentLikeCount, setCommentLikeCount] = useState(comment.likes);

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
    setCommentLikeCount(comment.likes);
    setIsCommentLiked(false);
  }, [comment.id, comment.likes]);

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

  const showEdit = feedCommentAllowsEdit(currentUserId, comment);
  const showDelete = feedCommentAllowsDelete(currentUserId, comment);
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

  const handleCommentLikeClick = () => {
    const nextLiked = !isCommentLiked;
    setIsCommentLiked(nextLiked);
    setCommentLikeCount((current) => (nextLiked ? current + 1 : Math.max(0, current - 1)));
  };

  const handleReplySubmit = () => {
    const trimmedReply = replyInput.trim();
    if (!trimmedReply) return;

    const newReply: FeedComment = {
      id: `reply-${Date.now()}`,
      authorId: currentUserId,
      authorName: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=You',
      content: trimmedReply,
      timestamp: 'Just now',
      likes: 0,
      canEdit: true,
      canDelete: true,
    };

    onAddReply(comment.id, newReply);
    setReplyInput('');
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editDraft.trim();
    const { isValid, isEmpty } = validateCommentContent(trimmed);
    if (!isValid || isEmpty) return;
    onEditComment(comment.id, trimmed);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    closeMenu();
    if (typeof window !== 'undefined' && !window.confirm('Delete this comment? This cannot be undone.')) {
      return;
    }
    onDeleteComment(comment.id);
  };

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

  const indent = depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-3' : '';

  return (
    <div className={`space-y-2 ${indent}`}>
      {overflowMenu}
      <div className="flex gap-2">
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="rounded-lg bg-gray-100 px-3 py-2">
            <ClassroomUserLink
              userId={comment.authorId}
              name={comment.authorName}
              className="text-sm font-semibold text-gray-900"
            />
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
                  className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-700 outline-none focus:border-blue-400"
                  rows={3}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!validateCommentContent(editDraft).isValid}
                    className="rounded px-3 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditDraft(comment.content);
                    }}
                    className="rounded px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">{comment.content}</p>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {formattedCommentTimestamp && (
              <span className="text-xs text-gray-500">{formattedCommentTimestamp}</span>
            )}
            <button
              type="button"
              onClick={handleCommentLikeClick}
              className={`hidden items-center gap-1 text-xs font-medium transition ${
                isCommentLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={12} fill={isCommentLiked ? 'currentColor' : 'none'} />
              <span>{commentLikeCount}</span>
            </button>
            <div className="inline-flex items-center gap-0.5">
              {showOverflowMenu && (
                <button
                  ref={menuTriggerRef}
                  type="button"
                  onClick={openMenu}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Comment actions"
                  className="hidden h-7 w-7 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
                >
                  <MoreHorizontal size={16} />
                </button>
              )}
            </div>
          </div>

          {showReplyInput && (
            <div className="mt-2">
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleReplySubmit();
                  }
                }}
                placeholder="Write a reply..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400"
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="space-y-2">
          {!showReplies ? (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          ) : (
            <>
              {replies.map((reply) => (
                <ClassroomCommentBlock
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onAddReply={onAddReply}
                  onEditComment={onEditComment}
                  onDeleteComment={onDeleteComment}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowReplies(false)}
                className="text-xs font-medium text-gray-600 hover:text-gray-800"
              >
                Hide replies
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Community feed comment
interface CommentProps {
  comment: FeedComment;
  variant: 'classroom' | 'community';
}

const Comment: React.FC<CommentProps> = ({ comment, variant }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [localReplies, setLocalReplies] = useState<FeedComment[]>(comment.replies ?? []);
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [commentLikeCount, setCommentLikeCount] = useState(comment.likes);
  const [likedReplyIds, setLikedReplyIds] = useState<Record<string, boolean>>({});
  const [replyLikeCounts, setReplyLikeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setLocalReplies(comment.replies ?? []);
    setIsCommentLiked(false);
    setCommentLikeCount(comment.likes);
    const initialReplyLikeCounts = (comment.replies ?? []).reduce<Record<string, number>>((acc, reply) => {
      acc[reply.id] = reply.likes;
      return acc;
    }, {});
    setReplyLikeCounts(initialReplyLikeCounts);
    setLikedReplyIds({});
  }, [comment.id, comment.replies]);

  const handleCommentLikeClick = () => {
    const nextLiked = !isCommentLiked;
    setIsCommentLiked(nextLiked);
    setCommentLikeCount((current) => (nextLiked ? current + 1 : Math.max(0, current - 1)));
  };

  const handleReplyLikeClick = (replyId: string) => {
    const isCurrentlyLiked = Boolean(likedReplyIds[replyId]);
    const nextLiked = !isCurrentlyLiked;

    setLikedReplyIds((prev) => ({
      ...prev,
      [replyId]: nextLiked,
    }));

    setReplyLikeCounts((prev) => {
      const current = prev[replyId] ?? 0;
      return {
        ...prev,
        [replyId]: nextLiked ? current + 1 : Math.max(0, current - 1),
      };
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="rounded-lg bg-gray-100 px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">{comment.authorName}</p>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-gray-500">{comment.timestamp}</span>
            <button
              type="button"
              onClick={handleCommentLikeClick}
              className={`flex items-center gap-1 text-xs font-medium transition ${
                isCommentLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={12} fill={isCommentLiked ? 'currentColor' : 'none'} />
              {commentLikeCount > 0 && <span>{commentLikeCount}</span>}
            </button>
          </div>
        </div>
        {variant === 'community' && (
          <button type="button" className="text-gray-400 hover:text-red-500">
            <Heart size={16} />
          </button>
        )}
      </div>

      {variant === 'community' && localReplies.length > 0 && (
        <div className="ml-6 space-y-2">
          {!showReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View {localReplies.length} reply/replies
            </button>
          )}
          {showReplies &&
            localReplies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <img
                  src={reply.authorAvatar}
                  alt={reply.authorName}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="rounded-lg bg-gray-100 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">{reply.authorName}</p>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs text-gray-500">{reply.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleReplyLikeClick(reply.id)}
                      className={`flex items-center gap-1 text-xs font-medium transition ${
                        likedReplyIds[reply.id] ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart size={12} fill={likedReplyIds[reply.id] ? 'currentColor' : 'none'} />
                      {(replyLikeCounts[reply.id] ?? reply.likes) > 0 && (
                        <span>{replyLikeCounts[reply.id] ?? reply.likes}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// Feed Component

const Feed: React.FC<FeedPostProps> = ({
  id,
  authorId,
  authorName,
  authorAvatar,
  content,
  timestamp,
  attachments = [],
  likes,
  commentCount,
  likedByMe,
  comments,
  variant,
  currentUserId = 'current-user',
  canEdit = true,
  canDelete = true,
  onPostUpdate,
  onRequestPostEdit,
  onPostDelete,
  onLike,
  onComment,
  onShare,
  onSave,
  onReply,
  onViewAllComments,
  onLoadComments,

}) => {
const isLiked = likedByMe;
const likeCount = likes;
  const postTimestampLabel =
    variant === 'classroom'
      ? formatAbsoluteTimestamp(timestamp)
      : timestamp;
  const [localComments, setLocalComments] = useState(comments);
  const [commentInput, setCommentInput] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  useEffect(() => {

  if (
    showAllComments &&
    localComments.length === 0
  ) {

    onLoadComments?.(id);

  }

}, [
  showAllComments,
  localComments.length,
  onLoadComments,
  id
]);


  const lastComment = localComments.length > 0 ? localComments[localComments.length - 1] : null;
  const hasMoreComments = localComments.length > 1;
  const displayedCommentsCount = typeof commentCount === 'number'
    ? Math.max(0, commentCount)
    : localComments.length;
  const postAvatarSrc = authorAvatar?.trim() || buildAvatarFallback(authorName);

  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [postMenuCoords, setPostMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const postMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const postMenuPanelRef = useRef<HTMLDivElement>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(content);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);

  

  const closePostMenu = useCallback(() => {
    setPostMenuOpen(false);
    setPostMenuCoords(null);
  }, []);


const showPostEdit =
  authorId === currentUserId &&
  Boolean(
    onRequestPostEdit ||
      onPostUpdate
  ) &&
  canEdit !== false;

const showPostDelete =
  authorId === currentUserId &&
  Boolean(
    onPostDelete
  ) &&
  canDelete !== false;

  const showPostOwnerMenu = (showPostEdit || showPostDelete) && !isEditingPost;


  

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (variant === 'classroom') {
      console.log('Feed render attachments for post:', id, attachments);
    }
  }, [variant, id, attachments]);

  useEffect(() => {
    if (!isEditingPost) setEditPostContent(content);
  }, [content, id, isEditingPost]);

  useEffect(() => {
    if (!postMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (postMenuTriggerRef.current?.contains(t) || postMenuPanelRef.current?.contains(t)) return;
      closePostMenu();
    };
    const onScroll = () => closePostMenu();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePostMenu();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [postMenuOpen, closePostMenu]);

  const handleAddReply = useCallback((parentId: string, reply: FeedComment) => {
    setLocalComments((prev) => addFeedReply(prev, parentId, reply));
  }, []);

  const handleEditComment = useCallback((commentId: string, content: string) => {
    setLocalComments((prev) => updateFeedCommentContent(prev, commentId, content));
  }, []);

  const handleDeleteComment = useCallback((commentId: string) => {
    setLocalComments((prev) => removeFeedComment(prev, commentId));
  }, []);

const handleLikeClick = () => {
  onLike?.();
};

  const openPostMenu = () => {
    if (postMenuOpen) {
      closePostMenu();
      return;
    }
    const el = postMenuTriggerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const width = 144;
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8));
      const top = r.bottom + 4;
      setPostMenuCoords({ top, left });
    }
    setPostMenuOpen(true);
  };

  const handleSavePostEdit = () => {
    const trimmed = editPostContent.trim();
    const v = validateThreadContent(trimmed);
    if (!v.isValid || v.isEmpty) return;
    onPostUpdate?.(id, trimmed);
    setIsEditingPost(false);
    closePostMenu();
  };

  const handleDeletePostClick = () => {
    closePostMenu();
    setShowDeletePostConfirm(true);
  };

  const confirmDeletePost = () => {
    setShowDeletePostConfirm(false);
    onPostDelete?.(id);
  };

  const cancelDeletePost = () => {
    setShowDeletePostConfirm(false);
  };

  
const postOwnerMenuPortal =
  postMenuOpen &&

    postMenuCoords &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={postMenuPanelRef}
        role="menu"
        className="fixed z-[200] w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        style={{ top: postMenuCoords.top, left: postMenuCoords.left }}
      >
        {showPostEdit && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              closePostMenu();
              if (onRequestPostEdit) {
                onRequestPostEdit(id);
                return;
              }
              setEditPostContent(content);
              setIsEditingPost(true);
            }}
          >
            <Pencil size={14} className="shrink-0 text-gray-500" />
            Edit
          </button>
        )}
        {showPostDelete && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
            onClick={handleDeletePostClick}
          >
            <Trash2 size={14} className="shrink-0" />
            Delete
          </button>
        )}
      </div>,
      document.body
    );

  const deletePostConfirmPortal =
    showDeletePostConfirm &&
    typeof document !== 'undefined' &&
    createPortal(
      <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/35 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
          <p className="mt-2 text-sm text-gray-600">Delete this post? This cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelDeletePost}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeletePost}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  const handleAddComment = () => {
    const trimmedComment = commentInput.trim();
    if (!trimmedComment) {
      return;
    }

    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      authorId: currentUserId,
      authorName: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=You',
      content: trimmedComment,
      timestamp: 'Just now',
      likes: 0,
      canEdit: true,
      canDelete: true,
    };

    setLocalComments((prev) => [...prev, newComment]);
    setCommentInput('');
    setShowAllComments(true);
    onComment?.();
  };

  const renderComment = (comment: FeedComment) => {
    if (variant === 'classroom') {
      return (
        <ClassroomCommentBlock
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onAddReply={handleAddReply}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onReply={onReply}
        />
      );
    }
    return (
      <Comment
        key={comment.id}
        comment={comment}
        variant={variant}
      />
    );
  };

  const openPostThread = () => {
    if (variant !== 'classroom') return;
    if (onViewAllComments) {
      onViewAllComments();
      return;
    }
    onComment?.();
  };

  const handlePostCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea, a, [role="menu"], [role="menuitem"]')) {
      return;
    }
    openPostThread();
  };

  const handlePostCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea, a, [role="menu"], [role="menuitem"]')) {
      return;
    }
    event.preventDefault();
    openPostThread();
  };

  return (
    <div
      className="overflow-visible rounded-xl border border-gray-100 bg-white transition hover:shadow-lg"
      onClick={handlePostCardClick}
      onKeyDown={handlePostCardKeyDown}
      role={variant === 'classroom' ? 'button' : undefined}
      tabIndex={variant === 'classroom' ? 0 : -1}
      aria-label={variant === 'classroom' ? 'Open post details' : undefined}
    >
      {postOwnerMenuPortal}
      {deletePostConfirmPortal}
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <img
              src={postAvatarSrc}
              alt={authorName}
              onError={(event) => {
                const target = event.currentTarget;
                const fallback = buildAvatarFallback(authorName);
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              {variant === 'classroom' ? (
                <ClassroomUserLink
                  userId={authorId}
                  name={authorName}
                  className="font-semibold text-gray-900"
                />
              ) : (
                <h3 className="font-semibold text-gray-900">{authorName}</h3>
              )}
              {postTimestampLabel && (
                <p className="text-sm text-gray-500">{postTimestampLabel}</p>
              )}
            </div>
          </div>
          {showPostOwnerMenu && (
            <button
              ref={postMenuTriggerRef}
              type="button"
              onClick={openPostMenu}
              aria-expanded={postMenuOpen}
              aria-haspopup="menu"
              aria-label="Post actions"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              <MoreHorizontal size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 sm:px-6">
        {isEditingPost
 && onPostUpdate && !onRequestPostEdit ? (
          <div className="space-y-2">
            <textarea
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 outline-none focus:border-blue-400"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSavePostEdit}
                disabled={!validateThreadContent(editPostContent).isValid}
                className="rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingPost(false);
                  setEditPostContent(content);
                }}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{content}</p>
        )}

        {/* Attachment Image Preview */}
        {attachments.filter(a => a.type === 'image').map((att) => (
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
        {attachments.filter(a => a.type === 'file').map((att) => (
          <div key={att.id} className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-[#F8FAFE] p-3" onClick={(e) => e.stopPropagation()}>
            <Paperclip size={18} className="text-[#5E4BC5] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{att.name || 'Attachment'}</p>
            </div>
            <a
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#5E4BC5]/10 px-3 py-1.5 text-xs font-semibold text-[#5E4BC5] transition hover:bg-[#5E4BC5]/20"
            >
              Open/Download
            </a>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 px-4 py-3 sm:px-6">
        {variant === 'classroom' ? (
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-2 transition ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
            </button>
            <button
              type="button"
              onClick={onComment}
              className="flex items-center gap-2 text-gray-600 transition hover:text-blue-500"
            >
              <MessageCircle size={18} />
              {displayedCommentsCount > 0 && (
                <span className="text-sm">{displayedCommentsCount}</span>
              )}
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-2 transition ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
            </button>
            <button
              type="button"
              onClick={onComment}
              className="flex items-center gap-2 text-gray-600 transition hover:text-blue-500"
            >
              <MessageCircle size={18} />
              {displayedCommentsCount > 0 && <span className="text-sm">{displayedCommentsCount}</span>}
            </button>
            <button
              type="button"
              onClick={onShare}
              className="flex items-center gap-2 text-gray-600 transition hover:text-green-500"
            >
              <Share2 size={18} />
              <span className="text-sm">Share</span>
            </button>
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-2 text-gray-600 transition hover:text-yellow-500"
            >
              <Bookmark size={18} />
              <span className="text-sm">Save</span>
            </button>
          </>
        )}
      </div>

      {localComments.length > 0 && (
        <div className="border-t border-gray-100 px-4 pt-3 sm:px-6">
          {hasMoreComments && (
            <button
              type="button"
              onClick={() => {
                setShowAllComments((prev) => !prev);
                onViewAllComments?.();
              }}
              className="mb-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showAllComments ? 'Hide comments' : `View all ${localComments.length} comments`}
            </button>
          )}

          {showAllComments
            ? localComments.map((comment) => renderComment(comment))
            : lastComment && renderComment(lastComment)}
        </div>
      )}

      {variant !== 'classroom' && (
        <div className="mt-3 border-t border-gray-100 px-4 pt-3 pb-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src={buildAvatarFallback('You')}
              alt="Your avatar"
              className="h-8 w-8 rounded-full"
            />
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
