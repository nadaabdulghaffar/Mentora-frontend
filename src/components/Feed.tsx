import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Reply as ReplyIcon } from 'lucide-react';

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
  comments: FeedComment[];
  variant: 'classroom' | 'community';
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onReply?: (commentId: string) => void;
  onViewAllComments?: () => void;
}

// Comment Component
interface CommentProps {
  comment: FeedComment;
  variant: 'classroom' | 'community';
  onReply?: () => void;
}

const Comment: React.FC<CommentProps> = ({ comment, variant, onReply }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyInput, setReplyInput] = useState('');
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

  const handleReplySubmit = () => {
    const trimmedReply = replyInput.trim();
    if (!trimmedReply) {
      return;
    }

    const newReply: FeedComment = {
      id: `reply-${Date.now()}`,
      authorId: 'current-user',
      authorName: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=You',
      content: trimmedReply,
      timestamp: 'Just now',
      likes: 0,
    };

    setLocalReplies((prev) => [...prev, newReply]);
    setReplyInput('');
    setShowReplyInput(false);
    setShowReplies(true);
  };

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex gap-2">
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="rounded-lg bg-gray-100 px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">
              {comment.authorName}
            </p>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-gray-500">{comment.timestamp}</span>
            <button
              onClick={handleCommentLikeClick}
              className={`flex items-center gap-1 text-xs font-medium transition ${
                isCommentLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={12} fill={isCommentLiked ? 'currentColor' : 'none'} />
              <span>{commentLikeCount}</span>
            </button>
            {variant === 'classroom' && (
              <button
                onClick={() => {
                  setShowReplyInput((prev) => !prev);
                  onReply?.();
                }}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <ReplyIcon size={12} />
                Reply
              </button>
            )}
          </div>

          {variant === 'classroom' && showReplyInput && (
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
        {variant === 'community' && (
          <button className="text-gray-400 hover:text-red-500">
            <Heart size={16} />
          </button>
        )}
      </div>

      {/* Replies for Classroom */}
      {variant === 'classroom' && localReplies.length > 0 && (
        <div className="ml-6 space-y-2">
          {!showReplies && (
            <button
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
                    <p className="text-sm font-semibold text-gray-900">
                      {reply.authorName}
                    </p>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {reply.timestamp}
                    </span>
                    <button
                      onClick={() => handleReplyLikeClick(reply.id)}
                      className={`flex items-center gap-1 text-xs font-medium transition ${
                        likedReplyIds[reply.id] ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart size={12} fill={likedReplyIds[reply.id] ? 'currentColor' : 'none'} />
                      <span>{replyLikeCounts[reply.id] ?? reply.likes}</span>
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
  authorName,
  authorAvatar,
  content,
  timestamp,
  attachments = [],
  likes,
  comments,
  variant,
  onLike,
  onComment,
  onShare,
  onSave,
  onReply,
  onViewAllComments,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [localComments, setLocalComments] = useState(comments);
  const [commentInput, setCommentInput] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const lastComment = localComments.length > 0 ? localComments[localComments.length - 1] : null;
  const hasMoreComments = localComments.length > 1;

  const handleLikeClick = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((current) => (nextLiked ? current + 1 : Math.max(0, current - 1)));
    onLike?.();
  };

  const handleAddComment = () => {
    const trimmedComment = commentInput.trim();
    if (!trimmedComment) {
      return;
    }

    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      authorId: 'current-user',
      authorName: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=You',
      content: trimmedComment,
      timestamp: 'Just now',
      likes: 0,
    };

    setLocalComments((prev) => [...prev, newComment]);
    setCommentInput('');
    setShowAllComments(true);
    onComment?.();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{authorName}</h3>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3 text-gray-800">{content}</p>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {attachments.map((attachment) => (
            <div key={attachment.id}>
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt="attachment"
                  className="h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="text-2xl">📎</div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium text-gray-700">
                      {attachment.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mb-3 border-t border-gray-100" />

      {/* Action Buttons */}
      <div className="mb-3 flex items-center justify-between">
        {variant === 'classroom' ? (
          <>
            {/* Classroom variant: Keep likes/comments adjacent and icon-only reply */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-2 transition ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span className="text-sm">{likeCount}</span>
              </button>
              <button
                onClick={onComment}
                className="flex items-center gap-2 text-gray-600 transition hover:text-blue-500"
              >
                <MessageCircle size={18} />
                <span className="text-sm">{localComments.length}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Community variant: Like, Comment, Share, Save */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-2 transition ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button
              onClick={onComment}
              className="flex items-center gap-2 text-gray-600 transition hover:text-blue-500"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{localComments.length}</span>
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-2 text-gray-600 transition hover:text-green-500"
            >
              <Share2 size={18} />
              <span className="text-sm">Share</span>
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 text-gray-600 transition hover:text-yellow-500"
            >
              <Bookmark size={18} />
              <span className="text-sm">Save</span>
            </button>
          </>
        )}
      </div>

      {/* Comments Section */}
      {localComments.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          {/* Show View All Comments if there are multiple comments */}
          {hasMoreComments && (
            <button
              onClick={() => {
                setShowAllComments((prev) => !prev);
                onViewAllComments?.();
              }}
              className="mb-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showAllComments ? 'Hide comments' : `View all ${localComments.length} comments`}
            </button>
          )}

          {/* Show comments */}
          {showAllComments
            ? localComments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  variant={variant}
                  onReply={() => onReply?.(comment.id)}
                />
              ))
            : lastComment && (
                <Comment
                  comment={lastComment}
                  variant={variant}
                  onReply={() => onReply?.(lastComment.id)}
                />
              )}
        </div>
      )}

      {/* Comment Input */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2">
          <img
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=You"
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
    </div>
  );
};

export default Feed;
