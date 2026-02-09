export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
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

export interface MentorProfile {
  yearsOfExperience: number | string;
  linkedinUrl?: string;
  countryCode?: string;
  domainId?: string;
  subDomainIds?: string[];
  technologyIds?: string[];
  bio?: string;
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
