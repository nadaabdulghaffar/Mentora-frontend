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

/** Local mock shape — replace with API DTO when analytics endpoint exists. */
export interface AiFeedbackInsights {
  satisfactionPercentage: number;
  sentimentCounts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summary: string;
  positiveSummary: string;
  negativeSummary: string;
}
