import type { CommunityPostResponse } from '../../../services/communityService';
import type { CommunityThread } from '../types';
import { resolveAuthorAvatar } from '../utils/authorAvatar';
import { toAbsoluteFileUrl } from '../../../services/messagingService';

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
    attachments: (post.imageUrl || post.fileUrl)
      ? [
          ...(post.imageUrl
            ? [
                {
                  id: `${post.communityPostId}-image`,
                  type: 'image' as const,
                  url: toAbsoluteFileUrl(post.imageUrl),
                  name: 'Post image',
                },
              ]
            : []),
          ...(post.fileUrl
            ? [
                {
                  id: `${post.communityPostId}-file`,
                  type: 'file' as const,
                  url: toAbsoluteFileUrl(post.fileUrl),
                  name: post.fileName || 'Attached file',
                },
              ]
            : []),
        ]
      : undefined,
    isLiked: post.isLiked,
    isSaved: post.isSaved,
    canEdit: post.canEdit,
    canDelete: post.canDelete,
    communityId,
  };
}
