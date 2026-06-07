/**
 * useThreads Hook
 * Manages thread data, sorting, filtering, and search
 */

import { useState, useCallback, useMemo } from 'react';
import type { CommunityThread, ThreadComment, FeedFilter } from '../types';
import {
  sortThreads,
  filterThreadsByCategory,
  searchThreads,
  sortCommentsByTime,
  removeCommentFromTree,
  updateCommentContentInTree,
} from '../utils/threadUtils';

interface UseThreadsOptions {
  initialThreads: CommunityThread[];
}

export const useThreads = ({ initialThreads }: UseThreadsOptions) => {
  const [threads, setThreads] = useState<CommunityThread[]>(initialThreads);
  const [filter, setFilter] = useState<FeedFilter>({
    sortBy: 'recent',
  });
  const [selectedThread, setSelectedThread] = useState<CommunityThread | null>(null);

  // Apply filters and sorting
  const filteredThreads = useMemo(() => {
    let result = [...threads];

    // Apply search
    if (filter.searchQuery) {
      result = searchThreads(result, filter.searchQuery);
    }

    // Apply category filter
    if (filter.category) {
      result = filterThreadsByCategory(result, filter.category);
    }

    // Apply sorting
    result = sortThreads(result, filter.sortBy);

    return result;
  }, [threads, filter]);

  // Handle filter changes
  const updateFilter = useCallback((updates: Partial<FeedFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update sort
  const setSortBy = useCallback((sortBy: FeedFilter['sortBy']) => {
    setFilter((prev) => ({ ...prev, sortBy }));
  }, []);

  // Update search query
  const setSearchQuery = useCallback((query: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // Update category filter
  const setCategory = useCallback((category?: string) => {
    setFilter((prev) => ({ ...prev, category }));
  }, []);

  // Add new thread
  const addThread = useCallback((thread: CommunityThread) => {
    setThreads((prev) => [thread, ...prev]);
  }, []);

  // Update thread
  const updateThread = useCallback((threadId: string, updates: Partial<CommunityThread>) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, ...updates } : thread
      )
    );
    setSelectedThread((prev) =>
      prev && prev.id === threadId ? { ...prev, ...updates } : prev
    );
  }, []);

  // Delete thread
  const deleteThread = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
    setSelectedThread((prev) => (prev?.id === threadId ? null : prev));
  }, []);

  // Like/unlike thread (keeps selectedThread in sync when modal is open)
  const toggleThreadLike = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1,
            isLiked: !thread.isLiked,
          };
        }
        return thread;
      })
    );
    setSelectedThread((prev) => {
      if (!prev || prev.id !== threadId) return prev;
      return {
        ...prev,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !prev.isLiked,
      };
    });
  }, []);

  const toggleThreadSave = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          return { ...thread, isSaved: !thread.isSaved };
        }
        return thread;
      })
    );
    setSelectedThread((prev) => {
      if (!prev || prev.id !== threadId) return prev;
      return { ...prev, isSaved: !prev.isSaved };
    });
  }, []);

  // Add comment to thread
  const addComment = useCallback(
    (threadId: string, comment: ThreadComment) => {
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              comments: [comment, ...thread.comments],
              commentCount: thread.commentCount + 1,
            };
          }
          return thread;
        })
      );
      setSelectedThread((prev) => {
        if (!prev || prev.id !== threadId) return prev;
        return {
          ...prev,
          comments: [comment, ...prev.comments],
          commentCount: prev.commentCount + 1,
        };
      });
    },
    []
  );

  const addReplyToComment = useCallback(
    (threadId: string, parentCommentId: string, reply: ThreadComment) => {
      const attachReply = (comments: ThreadComment[]): ThreadComment[] =>
        comments.map((c) => {
          if (c.id === parentCommentId) {
            return { ...c, replies: [...(c.replies ?? []), reply] };
          }
          if (c.replies?.length) {
            return { ...c, replies: attachReply(c.replies) };
          }
          return c;
        });

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== threadId) return thread;
          return {
            ...thread,
            comments: attachReply(thread.comments),
            commentCount: thread.commentCount + 1,
          };
        })
      );
      setSelectedThread((prev) => {
        if (!prev || prev.id !== threadId) return prev;
        return {
          ...prev,
          comments: attachReply(prev.comments),
          commentCount: prev.commentCount + 1,
        };
      });
    },
    []
  );

  const toggleCommentLike = useCallback((threadId: string, commentId: string) => {
    const mapComments = (comments: ThreadComment[]): ThreadComment[] =>
      comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            likes: c.isLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
            isLiked: !c.isLiked,
          };
        }
        if (c.replies?.length) {
          return { ...c, replies: mapComments(c.replies) };
        }
        return c;
      });

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? { ...thread, comments: mapComments(thread.comments) }
          : thread
      )
    );
    setSelectedThread((prev) =>
      prev && prev.id === threadId
        ? { ...prev, comments: mapComments(prev.comments) }
        : prev
    );
  }, []);

  // Delete comment from thread (including nested replies under that comment)
  const deleteComment = useCallback((threadId: string, commentId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        const { comments: next, removed } = removeCommentFromTree(thread.comments, commentId);
        if (removed === 0) return thread;
        return {
          ...thread,
          comments: next,
          commentCount: Math.max(0, thread.commentCount - removed),
        };
      })
    );
    setSelectedThread((prev) => {
      if (!prev || prev.id !== threadId) return prev;
      const { comments: next, removed } = removeCommentFromTree(prev.comments, commentId);
      if (removed === 0) return prev;
      return {
        ...prev,
        comments: next,
        commentCount: Math.max(0, prev.commentCount - removed),
      };
    });
  }, []);

  const editComment = useCallback((threadId: string, commentId: string, content: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? { ...thread, comments: updateCommentContentInTree(thread.comments, commentId, content) }
          : thread
      )
    );
    setSelectedThread((prev) =>
      prev && prev.id === threadId
        ? { ...prev, comments: updateCommentContentInTree(prev.comments, commentId, content) }
        : prev
    );
  }, []);

  // Get thread by ID
  const getThreadById = useCallback(
    (threadId: string): CommunityThread | undefined => {
      return threads.find((t) => t.id === threadId);
    },
    [threads]
  );

  // Get sorted comments for a thread
  const getSortedComments = useCallback(
    (threadId: string, sortBy: 'recent' | 'popular' = 'recent') => {
      const thread = getThreadById(threadId);
      if (!thread) return [];

      if (sortBy === 'recent') {
        return sortCommentsByTime(thread.comments);
      }
      return thread.comments.sort((a, b) => b.likes - a.likes);
    },
    [getThreadById]
  );

  return {
    // State
    threads: filteredThreads,
    allThreads: threads,
    filter,
    selectedThread,

    // Thread operations
    addThread, updateThread, deleteThread, setThreads, getThreadById, setSelectedThread,

    // Like operations
    toggleThreadLike,
    toggleThreadSave,
    toggleCommentLike,

    // Comment operations
    addComment,
    addReplyToComment,
    deleteComment,
    editComment,
    getSortedComments,

    // Filter operations
    updateFilter,
    setSortBy,
    setSearchQuery,
    setCategory,
  };
};