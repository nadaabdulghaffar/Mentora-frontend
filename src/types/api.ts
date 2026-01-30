// أنواع البيانات المشتركة

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
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
  yearsOfExperience: number;
  currentTitle: string;
  companyName: string;
  expertiseAreas: string[];
  bio?: string;
}

export interface MenteeProfile {
  currentCareerGoalId?: string;
  currentSkillLevel?: string;
  preferredLearningStyleId?: string;
  interests?: string[];
  subDomains?: string[];
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Domain {
  id: string;
  name: string;
}

export interface SubDomain {
  id: string;
  domainId: string;
  name: string;
}

export interface CareerGoal {
  id: string;
  name: string;
}

export interface LearningStyle {
  id: string;
  name: string;
  description?: string;
}
