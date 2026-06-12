export enum ReportTargetType {
  User = 0,
  Post = 1,
  Event = 2,
  Comment = 3,
}

export type ReportReason =
  | 'Spam'
  | 'Harassment'
  | 'FakeProfile'
  | 'InappropriateContent'
  | 'Scam'
  | 'Other';

export interface SubmitReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  ownerUserId: string;
  reason: ReportReason;
  description?: string;
}
