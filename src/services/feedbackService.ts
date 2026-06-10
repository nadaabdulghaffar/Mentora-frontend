import apiClient from './api';
import type { ApiResponse } from '../types/api';
import type {
  FeedbackEligibilityResponse,
  FeedbackReviewDto,
  MentorReviewsResponse,
  SubmitFeedbackRequest,
  UpdateFeedbackRequest,
  SentimentSummaryDto,
} from '../pages/profile/feedback/types';

const DEFAULT_PAGE_SIZE = 10;

export async function getMentorReviews(
  mentorUserId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<MentorReviewsResponse> {
  const response = await apiClient.get<ApiResponse<MentorReviewsResponse>>(
    `/mentors/${mentorUserId}/reviews`,
    {
      params: { page, pageSize },
    }
  );

  if (!response.data?.success || !response.data.data) {
    throw new Error(response.data?.message || 'Failed to load mentor reviews.');
  }

  return response.data.data;
}

export async function getFeedbackEligibility(
  programId: number
): Promise<FeedbackEligibilityResponse> {
  const response = await apiClient.get<ApiResponse<FeedbackEligibilityResponse>>(
    `/feedback/eligibility/${programId}`
  );

  if (!response.data?.success || !response.data.data) {
    throw new Error(response.data?.message || 'Failed to check feedback eligibility.');
  }

  return response.data.data;
}

export async function getMyFeedback(programId: number): Promise<FeedbackReviewDto> {
  const response = await apiClient.get<ApiResponse<FeedbackReviewDto>>(
    `/feedback/my/${programId}`
  );

  if (!response.data?.success || !response.data.data) {
    throw new Error(response.data?.message || 'Failed to load your feedback.');
  }

  return response.data.data;
}

export async function submitFeedback(
  data: SubmitFeedbackRequest
): Promise<FeedbackReviewDto> {
  const response = await apiClient.post<ApiResponse<FeedbackReviewDto>>('/feedback', data);

  if (!response.data?.success || !response.data.data) {
    throw new Error(response.data?.message || 'Failed to submit feedback.');
  }

  return response.data.data;
}

export async function updateFeedback(
  feedbackId: string,
  data: UpdateFeedbackRequest
): Promise<FeedbackReviewDto> {
  const response = await apiClient.patch<ApiResponse<FeedbackReviewDto>>(
    `/feedback/${feedbackId}`,
    data
  );

  if (!response.data?.success || !response.data.data) {
    throw new Error(response.data?.message || 'Failed to update feedback.');
  }

  return response.data.data;
}

export async function deleteFeedback(feedbackId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<boolean>>(`/feedback/${feedbackId}`);

  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Failed to delete feedback.');
  }
}

export async function getMentorFeedbackSummary(
  mentorId: string
): Promise<SentimentSummaryDto> {
  const response = await apiClient.get<ApiResponse<SentimentSummaryDto>>(
    `/Analytics/mentor-feedback-summary/${mentorId}`
  );

  if (!response.data?.success || !response.data.data) {
    throw new Error(response.data?.message || 'Failed to load feedback analytics.');
  }

  return response.data.data;
}
