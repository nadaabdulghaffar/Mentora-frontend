export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Query params for explore tab and preview endpoints (maps to ExploreSearchRequest). */
export interface ExploreSearchParams {
  searchQuery?: string;
  domainId?: number;
  subDomainId?: number;
  recommendedForYou?: boolean;
  pageNumber?: number;
  pageSize?: number;
  openedNow?: boolean;
  targetLevel?: number;
  educationLevel?: number;
}

export interface CompleteRegistrationRequest {
  registrationToken: string;
  role: 'mentee' | 'mentor';
}

export interface VerifyEmailRequest {
  token: string;
  email: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface UserBasicInfo {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string | null;
}

export interface RegistrationFlowResponse {
  registrationToken: string;
  currentStep: string;
  nextStep: string;
  expiresAt: string;
  user: UserBasicInfo;
}

export interface RegistrationCompleteResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface MentorProfile {
  yearsOfExperience: number | string;
  linkedinUrl?: string;
  countryCode?: string;
  domainId?: string | number;
  subDomainIds?: Array<string | number>;
  technologyIds?: Array<string | number>;
  bio?: string;
  cvUrl?: string;
}

export interface MenteeProfile {
  educationStatus?: string;
  countryCode?: string;
  careerGoalId?: string;
  learningStyleId?: string;
  domainId?: string;
  subDomainIds?: string[];
  experienceLevel?: string;
  currentLevel?: string;
  technologyIds?: string[];
  technologyInterests?: TechnologyInterest[];
  bio?: string;
}

export interface TechnologyInterest {
  technologyId: string;
  experienceLevel: string;
}

export interface MentorProfileRequest extends MentorProfile {
  registrationToken: string;
}

export interface MenteeProfileRequest extends MenteeProfile {
  registrationToken: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface LookupItem {
  id: string;
  name: string;
}

export interface Domain extends LookupItem {}

export interface SubDomain extends LookupItem {
  domainId: string;
}

export interface CareerGoal extends LookupItem {}

export interface LearningStyle extends LookupItem {
  description?: string;
}

export interface Technology extends LookupItem {
  subDomainId?: string;
}

export type EducationStatus = string;
export type ExperienceLevel = string;

export interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface MentorProgramItem {
  programId: number;
  title: string;
  description: string;
  imageUrl?: string;
  applicantsCount?: number;
  deadline?: string;
  status: string;
}
