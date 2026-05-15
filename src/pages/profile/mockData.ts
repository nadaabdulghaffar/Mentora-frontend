import type {
  ProfileEntity,
  ProgramCardData,
  ReviewItem,
  RoadmapSummary,
} from './types';

const AVATAR =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nourhan&backgroundColor=b6e3f4';

const PROGRAM_IMG_1 =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80';
const PROGRAM_IMG_2 =
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80';

const mentorBio =
  'Dedicated UX Designer with over 4 years of experience crafting intuitive digital experiences. I am passionate about helping emerging designers build strong foundations in design systems, accessibility, and user-centered thinking.';

const menteeBio =
  'Ambitious learner seeking structured mentorship to accelerate growth and gain clarity in career direction. Motivated to follow a guided roadmap and apply knowledge through practical tasks.';

const defaultPrograms: ProgramCardData[] = [
  {
    id: 'p1',
    imageUrl: PROGRAM_IMG_1,
    tag: 'LEADERSHIP',
    tagVariant: 'leadership',
    durationWeeks: 12,
    title: 'Future Leaders Track',
    description:
      'Develop the soft skills and strategic mindset required for senior management roles in tech organizations.',
    instructorName: 'Mona Zaki',
    instructorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 'p2',
    imageUrl: PROGRAM_IMG_2,
    tag: 'DESIGN',
    tagVariant: 'design',
    durationWeeks: 8,
    title: 'UX Research Fundamentals',
    description:
      'Master user research methodologies alongside industry experts and apply them to real product challenges.',
    instructorName: 'Mona Zaki',
    instructorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
  },
];

const defaultReviews: ReviewItem[] = [
  {
    id: 'r1',
    authorName: 'Sarah Jenkins',
    authorAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
    rating: 5,
    date: 'Oct 12, 2023',
    text: 'Norhan is an incredible mentor! She helped me completely restructure my portfolio and gave actionable feedback every session.',
  },
  {
    id: 'r2',
    authorName: 'Marcus Reed',
    authorAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    rating: 5,
    date: 'Sep 28, 2023',
    text: 'Clear communication, structured sessions, and deep expertise in design systems. Highly recommend.',
  },
  {
    id: 'r3',
    authorName: 'Elena Rodriguez',
    authorAvatar:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=80&q=80',
    rating: 5,
    date: 'Aug 15, 2023',
    text: 'Patient, encouraging, and very knowledgeable. My confidence as a designer improved tremendously.',
  },
];

const roadmapList: RoadmapSummary[] = [
  {
    id: 'rm1',
    title: 'Brand Identity Architect',
    description:
      'Go beyond logos. Learn the psychological and strategic framework of building iconic global brands.',
    phaseCount: 5,
  },
  {
    id: 'rm2',
    title: 'Portfolio Growth Sprint',
    description:
      'Build a sharper portfolio through weekly critique, case study rewrites, and presentation practice.',
    phaseCount: 4,
  },
  {
    id: 'rm3',
    title: 'UX Systems Foundations',
    description:
      'Create reusable components, define tokens, and learn how to structure scalable design systems.',
    phaseCount: 6,
  },
];

/** Public mentor profile (visit another mentor) — stable demo id */
export const DEMO_PUBLIC_MENTOR_ID = 'demo-public-mentor';

/** Public mentee profile */
export const DEMO_PUBLIC_MENTEE_ID = 'demo-public-mentee';

function baseMentorProfile(overrides: Partial<ProfileEntity>): ProfileEntity {
  return {
    userId: 'mentor-base',
    role: 'mentor',
    displayName: 'Norhan Mohamed',
    headline: 'UX Designer',
    location: 'Cairo, Egypt',
    email: 'norhan@gmail.com',
    avatarUrl: AVATAR,
    bio: mentorBio,
    socialLinks: [
      { id: 's1', platform: 'linkedin', label: 'LinkedIn', url: '#' },
      { id: 's2', platform: 'portfolio', label: 'Portfolio', url: '#' },
      { id: 's3', platform: 'behance', label: 'Behance', url: '#' },
    ],
    education: [
      {
        id: 'e1',
        degree: 'Bachelor of Design',
        faculty: 'Faculty of Fine Arts',
        institution: 'Design University',
        startYear: '2016',
        endYear: '2020',
      },
    ],
    experience: [
      {
        id: 'x1',
        title: 'UX Designer',
        company: 'TechCorp',
        startYear: '2022',
        endYear: 'Present',
      },
      {
        id: 'x2',
        title: 'Junior Designer',
        company: 'StartupXYZ',
        startYear: '2020',
        endYear: '2022',
      },
    ],
    stats: {
      hoursMentored: 36,
      activeMentees: 74,
      completedSessions: 3,
      averageRating: 4.2,
    },
    activeApplications: defaultPrograms,
    mentorshipPrograms: defaultPrograms,
    reviewAverage: 4.9,
    reviewTotal: 74,
    reviewDistribution: {
      stars5: 68,
      stars4: 4,
      stars3: 2,
      stars2: 0,
      stars1: 0,
    },
    reviews: defaultReviews,
    roadmaps: roadmapList,
    ...overrides,
  };
}

function baseMenteeProfile(overrides: Partial<ProfileEntity>): ProfileEntity {
  return {
    userId: 'mentee-base',
    role: 'mentee',
    displayName: 'Norhan Mohamed',
    headline: 'Product Designer',
    location: 'Cairo, Egypt',
    email: 'norhan@gmail.com',
    avatarUrl: AVATAR,
    bio: menteeBio,
    socialLinks: [
      { id: 's1', platform: 'linkedin', label: 'LinkedIn', url: '#' },
      { id: 's2', platform: 'portfolio', label: 'Portfolio', url: '#' },
      { id: 's3', platform: 'behance', label: 'Behance', url: '#' },
    ],
    education: [
      {
        id: 'e1',
        degree: 'Bachelor of Design',
        faculty: 'Faculty of Fine Arts',
        institution: 'Design University',
        startYear: '2016',
        endYear: '2020',
      },
    ],
    experience: [],
    enrolledProgram: defaultPrograms[1],
    aiInsight: {
      title: 'AI INSIGHT',
      body: 'Based on your experience at TechCorp, we found 3 mentors specialized in Enterprise SaaS scaling.',
      ctaLabel: 'View Matches',
    },
    ...overrides,
  };
}

export const MOCK_PROFILE_BY_ID: Record<string, ProfileEntity> = {
  [DEMO_PUBLIC_MENTOR_ID]: baseMentorProfile({
    userId: DEMO_PUBLIC_MENTOR_ID,
    displayName: 'Alex Rivera',
    headline: 'Senior UX Mentor',
    email: 'alex.rivera@mentora.com',
    /** Public mentor view: no stats column (design) */
    stats: undefined,
  }),
  [DEMO_PUBLIC_MENTEE_ID]: baseMenteeProfile({
    userId: DEMO_PUBLIC_MENTEE_ID,
    displayName: 'Sam Lee',
    headline: 'Aspiring PM',
    email: 'sam.lee@example.com',
    enrolledProgram: defaultPrograms[0],
    aiInsight: undefined,
  }),
};

export function mentorTemplateForOwner(userId: string, firstName: string, lastName: string, email: string): ProfileEntity {
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Mentor';
  return baseMentorProfile({
    userId,
    displayName,
    email: email || 'you@mentora.com',
  });
}

export function menteeTemplateForOwner(userId: string, firstName: string, lastName: string, email: string): ProfileEntity {
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Mentee';
  return baseMenteeProfile({
    userId,
    displayName,
    email: email || 'you@mentora.com',
  });
}
