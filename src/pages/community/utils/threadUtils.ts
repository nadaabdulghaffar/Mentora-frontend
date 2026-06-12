/**
 * Community Utilities
 * Helper functions for thread operations, formatting, and data manipulation
 */

import type { CommunityThread, ThreadComment } from '../types';

// ============================================
// Thread Operations
// ============================================

/**
 * Format timestamp to human-readable format
 * @param timestamp - ISO timestamp or relative time string
 * @returns Formatted timestamp
 */
export const formatTimestamp = (timestamp: string): string => {
  // If it's already a relative time string (e.g., "2 hours ago"), return it
  if (!timestamp.includes('T') && !timestamp.includes('Z')) {
    return timestamp;
  }

  // Ensure UTC parsing for ISO strings missing timezone info
  let parsedTimestamp = timestamp;
  const parts = parsedTimestamp.split('T');
  if (parts.length === 2) {
    const timePart = parts[1];
    if (!parsedTimestamp.endsWith('Z') && !timePart.includes('+') && !timePart.includes('-')) {
      parsedTimestamp += 'Z';
    }
  }

  const date = new Date(parsedTimestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

// ============================================
// Comment Operations
// ============================================

/**
 * Count total comments including nested replies
 * @param comments - Array of thread comments
 * @returns Total comment count
 */
export const getTotalCommentCount = (comments: ThreadComment[]): number => {
  return comments.reduce((total, comment) => {
    const replyCount = comment.replies ? comment.replies.length : 0;
    return total + 1 + replyCount;
  }, 0);
};

/** Counts a comment node plus all nested replies (for delete / metrics). */
export const countCommentSubtree = (comment: ThreadComment): number => {
  return 1 + (comment.replies?.reduce((n, r) => n + countCommentSubtree(r), 0) ?? 0);
};

/**
 * Removes a comment (and its reply subtree) by id anywhere in the tree.
 * @returns Updated tree and how many comment nodes were removed.
 */
export const removeCommentFromTree = (
  comments: ThreadComment[],
  commentId: string
): { comments: ThreadComment[]; removed: number } => {
  const result: ThreadComment[] = [];
  let removed = 0;

  for (const c of comments) {
    if (c.id === commentId) {
      removed += countCommentSubtree(c);
      continue;
    }
    if (c.replies?.length) {
      const { comments: newReplies, removed: nestedRemoved } = removeCommentFromTree(
        c.replies,
        commentId
      );
      if (nestedRemoved > 0) {
        removed += nestedRemoved;
        result.push({ ...c, replies: newReplies });
        continue;
      }
    }
    result.push(c);
  }

  return { comments: result, removed };
};

export const updateCommentContentInTree = (
  comments: ThreadComment[],
  commentId: string,
  content: string
): ThreadComment[] => {
  return comments.map((c) => {
    if (c.id === commentId) return { ...c, content };
    if (c.replies?.length) {
      return { ...c, replies: updateCommentContentInTree(c.replies, commentId, content) };
    }
    return c;
  });
};

/**
 * Sort comments by likes (highest first)
 * @param comments - Array of thread comments
 * @returns Sorted comments
 */
export const sortCommentsByLikes = (comments: ThreadComment[]): ThreadComment[] => {
  return [...comments].sort((a, b) => b.likes - a.likes);
};

/**
 * Sort comments by timestamp (newest first)
 * @param comments - Array of thread comments
 * @returns Sorted comments
 */
export const sortCommentsByTime = (comments: ThreadComment[]): ThreadComment[] => {
  return [...comments].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });
};

/**
 * Filter comments by search query
 * @param comments - Array of thread comments
 * @param query - Search query
 * @returns Filtered comments
 */
export const searchComments = (
  comments: ThreadComment[],
  query: string
): ThreadComment[] => {
  const lowerQuery = query.toLowerCase();
  return comments.filter((comment) =>
    comment.content.toLowerCase().includes(lowerQuery) ||
    comment.authorName.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get most relevant comments (by likes and recency)
 * @param comments - Array of thread comments
 * @param limit - Maximum number of comments to return
 * @returns Top comments
 */
export const getTopComments = (
  comments: ThreadComment[],
  limit: number = 3
): ThreadComment[] => {
  return [...comments]
    .sort((a, b) => {
      const likeDiff = b.likes - a.likes;
      if (likeDiff !== 0) return likeDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, limit);
};

// ============================================
// Thread Operations
// ============================================

/**
 * Search threads by content and title
 * @param threads - Array of threads
 * @param query - Search query
 * @returns Filtered threads
 */
export const searchThreads = (
  threads: CommunityThread[],
  query: string
): CommunityThread[] => {
  const lowerQuery = query.toLowerCase();
  return threads.filter((thread) => {
    const titleMatch = thread.title?.toLowerCase().includes(lowerQuery) ?? false;
    const contentMatch = thread.content.toLowerCase().includes(lowerQuery);
    const authorMatch = thread.authorName.toLowerCase().includes(lowerQuery);
    return titleMatch || contentMatch || authorMatch;
  });
};

/**
 * Sort threads based on criteria
 * @param threads - Array of threads
 * @param sortBy - Sort criteria: 'recent', 'popular', or 'trending'
 * @returns Sorted threads
 */
export const sortThreads = (
  threads: CommunityThread[],
  sortBy: 'recent' | 'popular' | 'trending' = 'recent'
): CommunityThread[] => {
  const sorted = [...threads];

  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => b.likes - a.likes);

    case 'trending':
      // Trending: combination of recent activity and engagement
      return sorted.sort((a, b) => {
        const engagementA = a.likes + a.commentCount * 2 + a.shareCount * 3;
        const engagementB = b.likes + b.commentCount * 2 + b.shareCount * 3;
        return engagementB - engagementA;
      });

    case 'recent':
    default:
      return sorted.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }
};

/**
 * Filter threads by category
 * @param threads - Array of threads
 * @param category - Category to filter by
 * @returns Filtered threads
 */
export const filterThreadsByCategory = (
  threads: CommunityThread[],
  category: string
): CommunityThread[] => {
  if (!category) return threads;
  return threads.filter((thread) => thread.category === category);
};

/**
 * Get thread statistics
 * @param thread - Community thread
 * @returns Object with engagement metrics
 */
export const getThreadStats = (thread: CommunityThread) => {
  return {
    engagement: thread.likes + thread.commentCount + thread.shareCount,
    commentPercentage: (thread.commentCount / (thread.likes || 1)) * 100,
    isPopular: thread.likes > 50,
    isActive: thread.commentCount > 10,
  };
};

/**
 * Get trending threads
 * @param threads - Array of threads
 * @param limit - Maximum number of threads
 * @returns Top trending threads
 */
export const getTrendingThreads = (
  threads: CommunityThread[],
  limit: number = 5
): CommunityThread[] => {
  return sortThreads(threads, 'trending').slice(0, limit);
};

// ============================================
// Thread Moderation
// ============================================

/**
 * Check if user can edit thread
 * @param userId - Current user ID
 * @param thread - Thread object
 * @returns Boolean indicating edit permission
 */
export const canEditThread = (userId: string, thread: CommunityThread): boolean => {
  return thread.authorId === userId && thread.canEdit !== false;
};

/**
 * Check if user can delete thread
 * @param userId - Current user ID
 * @param thread - Thread object
 * @param isAdmin - Whether user is admin
 * @returns Boolean indicating delete permission
 */
export const canDeleteThread = (
  userId: string,
  thread: CommunityThread,
  isAdmin: boolean = false
): boolean => {
  return (thread.authorId === userId && thread.canDelete !== false) || isAdmin;
};

// ============================================
// Content Validation
// ============================================

/**
 * Validate thread content
 * @param content - Thread content
 * @returns Object with validation result
 */
export const validateThreadContent = (content: string) => {
  const trimmed = content.trim();

  return {
    isValid: trimmed.length >= 1 && trimmed.length <= 5000,
    isEmpty: trimmed.length === 0,
    isTooLong: trimmed.length > 5000,
    characterCount: trimmed.length,
  };
};

/**
 * Validate comment content
 * @param content - Comment content
 * @returns Object with validation result
 */
export const validateCommentContent = (content: string) => {
  const trimmed = content.trim();

  return {
    isValid: trimmed.length >= 1 && trimmed.length <= 1000,
    isEmpty: trimmed.length === 0,
    isTooLong: trimmed.length > 1000,
    characterCount: trimmed.length,
  };
};

// ============================================
// Formatting Utilities
// ============================================

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, length: number = 150): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

/**
 * Extract mentions from content
 * @param content - Content text
 * @returns Array of mentioned user names
 */
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map((m) => m.substring(1)) : [];
};

/**
 * Highlight mentions in text (returns JSX-ready string)
 * @param content - Content text
 * @returns Content with mention markers
 */
export const highlightMentions = (content: string): string => {
  return content.replace(/@(\w+)/g, '<strong>@$1</strong>');
};
