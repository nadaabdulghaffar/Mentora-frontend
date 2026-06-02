/** Matches backend `Mentora.Domain.Enums.NotificationType`. */
export const NotificationType = {
  ApplicationSubmitted: 1,
  ApplicationAccepted: 2,
  ApplicationRejected: 3,
  SubmissionCreated: 4,
  SubmissionReviewed: 5,
  ClassroomPostCreated: 6,
  ClassroomPostLiked: 7,
  ClassroomPostCommented: 8,
  NewFollower: 9,
  MentorFeedbackAdded: 10,
  CommunityPostLiked: 11,
  CommunityPostCommented: 12,
  NewMessage: 13,
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];

/** Matches backend `Mentora.Domain.Enums.ReferenceType`. */
export const ReferenceType = {
  Program: 1,
  Application: 2,
  Submission: 3,
  ClassroomPost: 4,
  CommunityPost: 5,
  Conversation: 6,
  UserProfile: 7,
  Feedback: 8,
} as const;

export type ReferenceTypeValue =
  (typeof ReferenceType)[keyof typeof ReferenceType];
