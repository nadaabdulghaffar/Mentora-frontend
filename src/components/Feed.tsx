import React, { useState } from 'react';
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
            <button className="text-xs font-medium text-gray-600 hover:text-gray-900">
              {comment.likes} likes
            </button>
            {variant === 'classroom' && (
              <button
                onClick={onReply}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <ReplyIcon size={12} />
                Reply
              </button>
            )}
          </div>
        </div>
        {variant === 'community' && (
          <button className="text-gray-400 hover:text-red-500">
            <Heart size={16} />
          </button>
        )}
      </div>

      {/* Replies for Classroom */}
      {variant === 'classroom' && comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 space-y-2">
          {!showReplies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View {comment.replies.length} reply/replies
            </button>
          )}
          {showReplies &&
            comment.replies.map((reply) => (
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
                    <button className="text-xs font-medium text-gray-600 hover:text-gray-900">
                      {reply.likes} likes
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
  const lastComment = comments.length > 0 ? comments[comments.length - 1] : null;
  const hasMoreComments = comments.length > 1;

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
            {/* Classroom variant: Like, Comment, Reply */}
            <button
              onClick={onLike}
              className="flex items-center gap-2 text-gray-600 transition hover:text-red-500"
            >
              <Heart size={18} />
              <span className="text-sm">{likes}</span>
            </button>
            <button
              onClick={onComment}
              className="flex items-center gap-2 text-gray-600 transition hover:text-blue-500"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{comments.length}</span>
            </button>
            <button
              onClick={() => onReply?.(id)}
              className="flex items-center gap-2 text-gray-600 transition hover:text-green-500"
            >
              <ReplyIcon size={18} />
              <span className="text-sm">Reply</span>
            </button>
          </>
        ) : (
          <>
            {/* Community variant: Like, Comment, Share, Save */}
            <button
              onClick={onLike}
              className="flex items-center gap-2 text-gray-600 transition hover:text-red-500"
            >
              <Heart size={18} />
              <span className="text-sm">{likes}</span>
            </button>
            <button
              onClick={onComment}
              className="flex items-center gap-2 text-gray-600 transition hover:text-blue-500"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{comments.length}</span>
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
      {comments.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          {/* Show View All Comments if there are multiple comments */}
          {hasMoreComments && (
            <button
              onClick={onViewAllComments}
              className="mb-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all {comments.length} comments
            </button>
          )}

          {/* Show last comment */}
          {lastComment && (
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
            src="https://via.placeholder.com/32"
            alt="Your avatar"
            className="h-8 w-8 rounded-full"
          />
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm placeholder-gray-500 focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Feed;
