export type Applicant = {
  id: string;
  name: string;
  avatar: string;
  appliedDate: string;
  level: "Junior" | "Mid-Level" | "Senior";
  program: string;
  status: "Accepted" | "Pending" | "Cancelled";
};

export interface ApplicantListItemDto {
  applicationId: number;

  menteeName: string;

  menteeProfilePicture: string | null;

  appliedAt: string;

  level: string;

  programName: string;

  status: string;
}

export interface ProgramApplicantsResponseDto {
  items: ApplicantListItemDto[];

  currentPage: number;

  pageSize: number;

  totalCount: number;

  totalPages: number;

  allApplicantsCount: number;

  pendingCount: number;

  acceptedCount: number;

  rejectedCount: number;

  cancelledCount: number;
}