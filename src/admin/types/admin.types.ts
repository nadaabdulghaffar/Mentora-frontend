// Base types for pagination and API responses

// ---------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------

export interface AdminDashboardStatsDto {
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  bannedUsersCount: number;
}

export interface AdminProgramsDashboardStatsDto {
  totalPrograms: number;
  totalAcceptedMentees: number;
}

export interface AdminCommunityDashboardStatsDto {
  totalCommunities: number;
  totalMembers: number;
  totalPosts: number;
}

export interface AdminRoadmapDashboardStatsDto {
  totalRoadmaps: number;
}

// ---------------------------------------------------------
// Users
// ---------------------------------------------------------

export interface AdminUserListItemDto {
  userId: string;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
  status: string;
  joinDate: string;
}

export interface AdminUsersFilterParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  sort?: string;
}

// ---------------------------------------------------------
// Moderation
// ---------------------------------------------------------

export interface ReportedItemSummaryDto {
  reportedItemId: string;
  targetType: string;
  targetId: string;
  ownerName: string;
  ownerPictureUrl?: string;
  reportScore: number;
  reportThreshold: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  topReason: string;
  totalReports: number;
}

export interface ReportedContentSnapshotDto {
  title: string;
  body?: string;
  contentUrl?: string;
  createdAt: string;
}

export interface ReportSubmissionDto {
  reportId: string;
  reporterId: string;
  reporterName: string;
  reporterPictureUrl?: string;
  reason: string;
  description?: string;
  createdAt: string;
}

export interface UserActionHistoryDto {
  actionType: string;
  message?: string;
  issuedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface ReportedItemDetailDto {
  reportedItemId: string;
  targetType: string;
  targetId: string;

  content: ReportedContentSnapshotDto;

  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPictureUrl?: string;
  ownerRole: string;
  ownerJoinedAt: string;

  reportScore: number;
  reportThreshold: number;
  status: string;
  createdAt: string;
  updatedAt: string;

  reports: ReportSubmissionDto[];
  reasonBreakdown: Record<string, number>;
  ownerHistory: UserActionHistoryDto[];

  contentAction?: string;
  userAction?: string;
  adminNotes?: string;
  resolvedAt?: string;
}

export interface ModerationQueueFilterParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  targetType?: string;
}

// ---------------------------------------------------------
// Generic Entities
// ---------------------------------------------------------

export interface AdminActionRequest {
  contentAction: "None" | "Approved" | "ContentDeleted";
  userAction: "None" | "Warning" | "TemporaryBan" | "PermanentBan";
  banDurationHours?: number;
  userActionMessage?: string;
  adminNotes?: string;
}

// ---------------------------------------------------------
// Programs
// ---------------------------------------------------------

export interface AdminProgramListItemDto {
  programId: number;
  programTitle: string;
  programDescription?: string;
  domainName: string;
  mentorId: string;
  mentorName: string;
  createdDate: string;
  acceptedMenteesCount: number;
  pendingMenteesCount: number;
  rejectedMenteesCount: number;
}

export interface AdminProgramAcceptedMenteeDto {
  menteeId: string;
  fullName: string;
  email: string;
  acceptanceDate: string;
}

export interface AdminProgramDetailDto {
  programId: number;
  programTitle: string;
  programDescription?: string;
  createdDate: string;
  availability?: string;
  duration?: string;
  capacity: number;
  deadline: string;

  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  mentorProfilePictureUrl?: string;

  domainId: number;
  domainName: string;
  domainDescription?: string;

  acceptedMenteesCount: number;
  pendingMenteesCount: number;
  rejectedMenteesCount: number;

  mentees: AdminProgramAcceptedMenteeDto[];
}

// ---------------------------------------------------------
// Communities
// ---------------------------------------------------------

export interface AdminCommunityListItemDto {
  communityId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  domainName: string;
  createdAt: string;
  createdByUserName: string;
  memberCount: number;
  postCount: number;
}

// ---------------------------------------------------------
// Roadmaps
// ---------------------------------------------------------

export interface AdminRoadmapListItemDto {
  roadmapId: number;
  title: string;
  description?: string;
  duration: number;
  skillDomainName: string;
  domainName: string;
  targetLevelFrom?: string;
  targetLevelTo?: string;
  status?: string;
  createdAt: string;
  mentorId: string;
  mentorName: string;
  phasesCount: number;
}

export interface AdminEntityListItemDto {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  ownerName?: string;
}

export interface AdminEntityFilterParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
}

