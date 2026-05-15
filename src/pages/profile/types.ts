/**
 * Profile feature domain types.
 * UI-facing shapes — map API DTOs here when the backend is wired.
 */

export type ProfileRole = 'mentor' | 'mentee';

/** Logged-in user viewing self vs someone else's public page */
export type ProfileAudience = 'owner' | 'public';

export type SocialPlatform = 'linkedin' | 'portfolio' | 'behance' | 'other';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  faculty?: string;
  institution: string;
  startYear: string;
  endYear: string;
  year?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  startYear: string;
  endYear: string;
}

export interface ExperienceToolEntry {
  name: string;
  level: string;
}

export interface MentorStats {
  hoursMentored: number;
  activeMentees: number;
  completedSessions: number;
  averageRating: number;
}

export interface ProgramCardData {
  id: string;
  imageUrl: string;
  tag: string;
  tagVariant: 'leadership' | 'design';
  durationWeeks: number;
  title: string;
  description: string;
  instructorName: string;
  instructorAvatar: string;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  text: string;
}

export interface ReviewDistribution {
  stars5: number;
  stars4: number;
  stars3: number;
  stars2: number;
  stars1: number;
}

export interface RoadmapSummary {
  id: string;
  title: string;
  description: string;
  phaseCount: number;
}

export interface ProfileEntity {
  userId: string;
  role: ProfileRole;
  displayName: string;
  headline: string;
  location: string;
  email: string;
  avatarUrl: string;
  bio: string;
  socialLinks: SocialLink[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  domainId?: string;
  yearsOfExperience?: string;
  relevantExpertise?: string[];
  tools?: ExperienceToolEntry[];
  /** Mentor-only */
  stats?: MentorStats;
  /** Activity tab */
  activeApplications?: ProgramCardData[];
  mentorshipPrograms?: ProgramCardData[];
  /** Mentor reviews */
  reviewAverage?: number;
  reviewTotal?: number;
  reviewDistribution?: ReviewDistribution;
  reviews?: ReviewItem[];
  /** Mentor roadmaps tab */
  roadmaps?: RoadmapSummary[];
  /** Mentee activity */
  enrolledProgram?: ProgramCardData | null;
  /** Mentee owner — show AI insight column */
  aiInsight?: {
    title: string;
    body: string;
    ctaLabel: string;
  };
}

export type ProfileTabMentor = 'overview' | 'activity' | 'reviews' | 'roadmaps';
export type ProfileTabMentee = 'overview' | 'activity';
