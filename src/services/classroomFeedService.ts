import apiClient from "../config/api";

export const classroomFeedService = {
  async getFeed(programId: number) {
    const response = await apiClient.get(
      `/classroom/program/${programId}/feed`
    );

    return response.data;
  },

async createPost(
  programId: number,
  content: string,
  attachments?: Array<{ id?: string; url: string; name?: string; mimeType?: string; type?: string }>
) {

  const payload: any = { content };
  if (attachments && attachments.length > 0) {
    const normalized = attachments
      .map((attachment, index) => ({
        id: attachment.id || `attachment-${Date.now()}-${index}`,
        url: attachment.url,
        name: attachment.name || 'Attachment',
        mimeType: attachment.mimeType,
        type: attachment.type === 'image' ? 'image' : 'file',
      }))
      .filter((attachment) => Boolean(attachment.url?.trim()) && !attachment.url.startsWith('blob:'));

    if (normalized.length > 0) {
      payload.attachments = normalized;
    }
  }

  const response = await apiClient.post(
    `/classroom/program/${programId}/feed/posts`,
    payload
  );

  return response.data;
},

async deletePost(
  programId: number,
  postId: number
) {

  const response =
    await apiClient.delete(
      `/classroom/program/${programId}/feed/posts/${postId}`
    );

  return response.data;
},

async updatePost(
  programId: number,
  postId: number,
  content: string
) {

  const response =
    await apiClient.patch(
      `/classroom/program/${programId}/feed/posts/${postId}`,
      {
        content,
      }
    );

  return response.data;
},



async toggleLikePost(
  programId: number,
  postId: number
) {

  const response =
    await apiClient.post(
      `/classroom/program/${programId}/feed/posts/${postId}/like`
    );

  return response.data;
},

async getComments(
  programId: number,
  postId: number
) {

  const response =
    await apiClient.get(
      `/classroom/program/${programId}/feed/posts/${postId}/comments`
    );

  return response.data;
},

async createComment(
  programId: number,
  postId: number,
  content: string,
  parentCommentId?: number | null
) {

  const response =
    await apiClient.post(
      `/classroom/program/${programId}/feed/posts/${postId}/comments`,
      {
        content,
        parentCommentId,
      }
    );

  return response.data;
},

async updateComment(
  programId: number,
  commentId: number,
  content: string
) {

  const response =
    await apiClient.patch(
      `/classroom/program/${programId}/feed/comments/${commentId}`,
      {
        content
      }
    );

  return response.data;
},

async deleteComment(
  programId: number,
  commentId: number
) {

  const response =
    await apiClient.delete(
      `/classroom/program/${programId}/feed/comments/${commentId}`
    );

  return response.data;
},

};