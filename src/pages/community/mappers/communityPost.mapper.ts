import type { CommunityPostResponse } from '../../../services/communityService';
import type { CommunityThread } from '../types';
import { resolveAuthorAvatar } from '../utils/authorAvatar';

export function mapCommunityPostToThread(
  post: CommunityPostResponse,
  communityId: string
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
    shareCount: post.sharesCount,
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
    communityId,
  };
}
