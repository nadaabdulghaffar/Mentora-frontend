
import apiClient from "./api";

const CREATE_COMMUNITY_ENDPOINT =
  import.meta.env.VITE_CREATE_COMMUNITY_ENDPOINT ||
  "/communities/create";

const GET_ALL_COMMUNITIES_ENDPOINT =
  import.meta.env
    .VITE_GET_ALL_COMMUNITIES_ENDPOINT ||
  "/communities/all";

const GET_MY_COMMUNITIES_ENDPOINT =
  import.meta.env
    .VITE_GET_MY_COMMUNITIES_ENDPOINT ||
  "/communities/my";

const EXPLORE_COMMUNITIES_ENDPOINT =
  import.meta.env
    .VITE_EXPLORE_COMMUNITIES_ENDPOINT ||
  "/Explore/communities";

export const extractErrorMessage = (
  error: any
): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    "Something went wrong"
  );
};

export interface CreateCommunityPayload {
  domainId: number;

  name: string;

  description: string;

  coverImageUrl?: string;
}

export interface CommunityResponse {
  communityId: string;

  name: string;

  description: string;

  coverImageUrl?: string;

  domainId: number;

  membersCount: number;

  postsCount: number;

  createdAt: string;

  createdByUserName: string;

  createdByUserProfilePicture?: string;

  isMember: boolean;

  currentUserRole: string;

  canManage: boolean;
}

export const createCommunity =
  async (
    payload: CreateCommunityPayload
  ): Promise<CommunityResponse> => {
    const response =
      await apiClient.post(
        CREATE_COMMUNITY_ENDPOINT,
        payload
      );

    if (
      !response.data?.success ||
      !response.data?.data
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to create community"
      );
    }

    return response.data.data;
  };

export const getAllCommunities =
  async (): Promise<
    CommunityResponse[]
  > => {
    const response =
      await apiClient.get(
        GET_ALL_COMMUNITIES_ENDPOINT
      );

    if (
      !response.data?.success ||
      !response.data?.data
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to fetch communities"
      );
    }

    return response.data.data;
  };

export const getMyCommunities =
  async (): Promise<
    CommunityResponse[]
  > => {
    const response =
      await apiClient.get(
        GET_MY_COMMUNITIES_ENDPOINT
      );

    if (
      !response.data?.success ||
      !response.data?.data
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to fetch my communities"
      );
    }

    return response.data.data;
  };

export const exploreCommunities =
  async (
    searchQuery = ""
  ): Promise<
    CommunityResponse[]
  > => {
    const response =
      await apiClient.get(
        EXPLORE_COMMUNITIES_ENDPOINT,
        {
          params: {
            SearchQuery:
              searchQuery,
          },
        }
      );

    if (
      !response.data?.success ||
      !response.data?.data
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to explore communities"
      );
    }

    return response.data.data;
  };



export const getCommunityById =
  async (
    communityId: string
  ): Promise<CommunityResponse> => {
    const response =
      await apiClient.get(
        `/communities/${communityId}`
      );

    if (
      !response.data?.success ||
      !response.data?.data
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to fetch community"
      );
    }

    return response.data.data;
  };

  export interface UpdateCommunityPayload {
  name?: string;

  description?: string;

  coverImageUrl?: string;

  domainId?: number;
}

export const updateCommunity =
  async (
    communityId: string,

    payload: UpdateCommunityPayload
  ): Promise<CommunityResponse> => {
    const response =
      await apiClient.patch(
        `/communities/${communityId}`,
        payload
      );

    if (
      !response.data?.success ||
      !response.data?.data
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to update community"
      );
    }

    return response.data.data;
  };


export const deleteCommunity =
  async (
    communityId: string
  ): Promise<boolean> => {
    const response =
      await apiClient.delete(
        `/communities/${communityId}`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to delete community"
      );
    }

    return true;
  };

  
export const joinCommunity =
  async (
    communityId: string
  ): Promise<boolean> => {
    const response =
      await apiClient.post(
        `/communities/${communityId}/join`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to join community"
      );
    }

    return true;
  };

export const leaveCommunity =
  async (
    communityId: string
  ): Promise<boolean> => {
    const response =
      await apiClient.delete(
        `/communities/${communityId}/leave`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to leave community"
      );
    }

    return true;
  };


export interface CreatePostPayload {
  content: string;

  imageUrl?: string;

  linkUrl?: string;
}

export const createCommunityPost =
  async (
    communityId: string,
    payload: CreatePostPayload
  ) => {
    const response =
      await apiClient.post(
        `/communities/${communityId}/posts`,
        payload
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to create post"
      );
    }

    return response.data.data;
  };


export interface UpdatePostPayload {
  content?: string;

  imageUrl?: string;

  linkUrl?: string;
}

export const updateCommunityPost =
  async (
    postId: string,
    payload: UpdatePostPayload
  ) => {
    const response =
      await apiClient.patch(
        `/communities/posts/${postId}`,
        payload
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to update post"
      );
    }

    return response.data.data;
  };


export const deleteCommunityPost =
  async (
    postId: string
  ): Promise<boolean> => {
    const response =
      await apiClient.delete(
        `/communities/posts/${postId}`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to delete post"
      );
    }

    return true;
  };


export interface CommunityPostResponse {
  communityPostId: string;

  content: string;

  imageUrl?: string;

  linkUrl?: string;

  createdAt: string;

  authorId: string;

  authorName: string;

  authorProfilePicture?: string;

  likesCount: number;

  commentsCount: number;

  sharesCount: number;

  isLiked: boolean;

  isSaved: boolean;

  canEdit: boolean;

  canDelete: boolean;
}

export const getCommunityPosts =
  async (
    communityId: string
  ): Promise<
    CommunityPostResponse[]
  > => {
    const response =
      await apiClient.get(
        `/communities/${communityId}/posts`,
        {
          params: {
            page: 1,
            pageSize: 20,
          },
        }
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to fetch posts"
      );
    }

    return (
      response.data.data
        ?.items || []
    );
  };


export interface CommentResponse {
  communityCommentId: string;

  content: string;

  createdAt: string;

  authorId: string;

  authorName: string;

  authorProfilePicture?: string;
}

export const getPostComments =
  async (
    postId: string
  ): Promise<CommentResponse[]> => {
    const response =
      await apiClient.get(
        `/communities/posts/${postId}/comments`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to fetch comments"
      );
    }

    return response.data.data || [];
  };

export const createComment =
  async (
    postId: string,
    content: string
  ): Promise<string> => {
    const response =
      await apiClient.post(
        `/communities/posts/${postId}/comments`,
        {
          content,
        }
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to create comment"
      );
    }

    return response.data.data;
  };

export const updateComment =
  async (
    commentId: string,
    content: string
  ) => {
    const response =
      await apiClient.patch(
        `/communities/posts/comments/${commentId}`,
        {
          content,
        }
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to update comment"
      );
    }

    return response.data.data;
  };

export const deleteComment =
  async (
    commentId: string
  ): Promise<boolean> => {
    const response =
      await apiClient.delete(
        `/communities/posts/comments/${commentId}`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to delete comment"
      );
    }

    return true;
  };

export const togglePostLike =
  async (
    postId: string
  ): Promise<boolean> => {
    const response =
      await apiClient.post(
        `/communities/posts/${postId}/like`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to toggle like"
      );
    }

    return response.data.data;
  };


export interface CommunityMemberResponse {
  userId: string;

  firstName: string;

  lastName: string;

  profilePictureUrl?: string;

  role: string;
}


export const getCommunityMembers =
  async (
    communityId: string
  ): Promise<
    CommunityMemberResponse[]
  > => {
    const response =
      await apiClient.get(
        `/communities/${communityId}/members`
      );

    if (
      !response.data?.success
    ) {
      throw new Error(
        response.data?.message ||
          "Failed to fetch members"
      );
    }

    return (
      response.data.data || []
    );
  };



export default {
  createCommunity,
  getAllCommunities,
  getMyCommunities,
  exploreCommunities,
  getCommunityById,
  extractErrorMessage,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
leaveCommunity,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  getCommunityPosts,
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  togglePostLike,
  getCommunityMembers,
};