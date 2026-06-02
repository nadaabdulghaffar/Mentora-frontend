import type { CommunityFeedPostResponse } from '../../../services/communityService';
import type { CommunityThread } from '../types';
import { resolveAuthorAvatar } from '../utils/authorAvatar';

/**
 * Maps a global feed API row to CommunityThread (same shape as CommunityPage post mapping).
 */
export function mapFeedPostToThread(
  post: CommunityFeedPostResponse
): CommunityThread {
  return {
    id: post.communityPostId,
    authorId: post.authorId,
    authorName: post.authorName,
    authorProfilePicture: post.authorProfilePicture,
    authorAvatar: resolveAuthorAvatar(
      post.authorName,
      post.authorProfilePicture
    ),
    content: post.content,
    timestamp: post.createdAt,
    likes: post.likesCount,
    commentCount: post.commentsCount,
    shareCount: 0,
    comments: [],
    attachments: post.imageUrl
      ? [
          {
            id: post.communityPostId,
            type: 'image',
            url: post.imageUrl,
            name: 'Post image',
          },
        ]
      : undefined,
    isLiked: post.isLiked,
    isSaved: post.isSaved,
    canEdit: post.canEdit,
    canDelete: post.canDelete,
    communityId: post.communityId,
    communityName: post.communityName,
  };
}
