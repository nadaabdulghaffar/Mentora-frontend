/** Backend `FeedbackResponseDto` — camelCase at runtime via ASP.NET JSON serializer. */
export interface FeedbackReviewDto {
  feedbackId: string;
  programId: number;
  programTitle: string;
  menteeProfileId: string;
  reviewerName: string;
  reviewerProfilePicture?: string | null;
  mentorProfileId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

/** Backend `MentorReviewsDto`. */
export interface MentorReviewsResponse {
  mentorId: string;
  mentorName: string;
  mentorProfilePicture?: string | null;
  averageRating: number;
  bayesianRating: number;
  totalReviews: number;
  reviews: FeedbackReviewDto[];
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FeedbackEligibilityResponse {
  isEligible: boolean;
  alreadySubmitted: boolean;
  reason?: string | null;
}

export interface SubmitFeedbackRequest {
  programId: number;
  rating: number;
  comment?: string;
}

export interface UpdateFeedbackRequest {
  rating?: number;
  comment?: string;
}

/** Backend `SentimentSummaryDto`. */
export interface SentimentSummaryDto {
  mentor_id: string;
  mentor_name: string;
  satisfaction_rate: number;
  average_rating: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  };
  summary: string | null;
  top_positive_themes: string[];
  top_negative_themes: string[];
}
