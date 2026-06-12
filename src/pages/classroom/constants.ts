import type { FeedPostProps } from '../../components/Feed';
import type {
  SessionItem,
  ClassroomTask,
  RoadmapPhase,
  MentorRoadmapPhase,
  MentorStudent,
  MentorSubmissionRecord,
} from './types';

// Feed Posts
export const classroomFeedPosts: FeedPostProps[] = [
  {
    id: 'feed-1',
    authorId: 'mentor-1',
    authorName: 'Amina Hassan',
    authorAvatar: '',
    content:
      "I just shared a new resource on the 'Cognitive Load' thread. Understanding how much information a user can process at once is crucial for the Module 4 task.",
    timestamp: '2 hours ago',
    attachments: [
      {
        id: 'feed-1-image',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        name: 'Cognitive Load Notes',
      },
    ],
    likes: 24,
    likedByMe: false,
    comments: [
      {
        id: 'feed-1-comment-1',
        authorId: 'mentee-4',
        authorName: 'Sarah Chen',
        authorAvatar: '',
        content: 'Great share, this really explains why my previous layout felt overwhelming.',
        timestamp: '1 hour ago',
        likes: 2,
      },
    ],
    variant: 'classroom',
  },
  {
    id: 'feed-2',
    authorId: 'mentee-4',
    authorName: 'Sarah Chen',
    authorAvatar: '',
    content:
      "Has anyone found a good case study on the 'Zeigarnik Effect' applied to ed-tech dashboards? I want references for this week's mission.",
    timestamp: '5 hours ago',
    likes: 12,
    likedByMe: false,
    comments: [
      {
        id: 'feed-2-comment-1',
        authorId: 'mentee-8',
        authorName: 'Marcelo Thome',
        authorAvatar: '',
        content: 'Check the Duolingo teardown on growth design. It covers incomplete cycles really well.',
        timestamp: '2 hours ago',
        likes: 3,
      },
    ],
    variant: 'classroom',
  },
];

// Sessions
export const sessions: SessionItem[] = [
  {
    id: 'session-1',
    title: 'Advanced Typography & Layout Systems',
    dateLabel: 'TODAY • 10:30 AM',
    duration: '60 mins',
    live: true,
  },
  {
    id: 'session-2',
    title: 'Color Theory in Digital Ecosystems',
    dateLabel: 'OCT 14 • 02:00 PM',
    duration: '1 hour',
    live: false,
  },
  {
    id: 'session-3',
    title: 'Brand Identity Construction',
    dateLabel: 'OCT 16 • 09:00 AM',
    duration: '1 hour',
    live: false,
  },
];

// Initial Tasks — populated from API on page load
export const initialTasks: ClassroomTask[] = [];

// Mentor Students
export const initialMentorStudents: MentorStudent[] = [
  {
    id: 'student-1',
    name: 'Marcus Chen',
    email: 'm.chen@atelier.com',
    statusLabel: 'Needs Feedback',
    statusTone: 'feedback',
    moduleLabel: 'Module 2',
    progress: 45,
    completedTasks: 9,
    totalTasks: 22,
    lastActive: '2 hours ago',
  },
  {
    id: 'student-2',
    name: 'Aisha Lateef',
    email: 'a.lateef@atelier.com',
    statusLabel: 'Idle Student',
    statusTone: 'idle',
    moduleLabel: 'Module 1',
    progress: 12,
    completedTasks: 2,
    totalTasks: 22,
    lastActive: '> 48 hours',
  },
  {
    id: 'student-3',
    name: 'Jane Smith',
    email: 'j.smith@atelier.com',
    statusLabel: 'Module 3 Active',
    statusTone: 'active',
    moduleLabel: 'Module 3',
    progress: 82,
    completedTasks: 18,
    totalTasks: 22,
    lastActive: 'Today',
  },
  {
    id: 'student-4',
    name: 'Oscar Kim',
    email: 'o.kim@atelier.com',
    statusLabel: 'Module 5 Active',
    statusTone: 'active',
    moduleLabel: 'Module 5',
    progress: 95,
    completedTasks: 21,
    totalTasks: 22,
    lastActive: 'Today',
  },
  {
    id: 'student-5',
    name: 'Luciana Vera',
    email: 'l.vera@atelier.com',
    statusLabel: 'Needs Feedback',
    statusTone: 'feedback',
    moduleLabel: 'Module 4',
    progress: 58,
    completedTasks: 13,
    totalTasks: 22,
    lastActive: 'Today',
  },
];

// Mentor Task Submissions
export const mentorTaskSubmissions: Record<string, MentorSubmissionRecord[]> = {
  'mentor-task-1': [
    {
      id: 'mentor-task-1-sub-1',
      studentId: 'student-1',
      studentName: 'Marcus Chen',
      submittedAt: 'Apr 17, 2026 • 10:25 AM',
      grade: 91,
      reviewStatus: 'reviewed',
    },
    {
      id: 'mentor-task-1-sub-2',
      studentId: 'student-3',
      studentName: 'Jane Smith',
      submittedAt: 'Apr 17, 2026 • 01:40 PM',
      grade: 88,
      reviewStatus: 'reviewed',
    },
    {
      id: 'mentor-task-1-sub-3',
      studentId: 'student-5',
      studentName: 'Luciana Vera',
      submittedAt: 'Apr 18, 2026 • 09:10 AM',
      grade: 74,
      reviewStatus: 'needs-review',
    },
  ],
  'mentor-task-2': [
    {
      id: 'mentor-task-2-sub-1',
      studentId: 'student-2',
      studentName: 'Aisha Lateef',
      submittedAt: 'Apr 18, 2026 • 11:15 AM',
      grade: 67,
      reviewStatus: 'needs-review',
    },
    {
      id: 'mentor-task-2-sub-2',
      studentId: 'student-4',
      studentName: 'Oscar Kim',
      submittedAt: 'Apr 18, 2026 • 12:05 PM',
      grade: 92,
      reviewStatus: 'reviewed',
    },
  ],
  'mentor-task-3': [
    {
      id: 'mentor-task-3-sub-1',
      studentId: 'student-3',
      studentName: 'Jane Smith',
      submittedAt: 'Apr 18, 2026 • 08:55 AM',
      grade: 27,
      reviewStatus: 'needs-review',
    },
    {
      id: 'mentor-task-3-sub-2',
      studentId: 'student-1',
      studentName: 'Marcus Chen',
      submittedAt: 'Apr 18, 2026 • 09:40 AM',
      grade: 31,
      reviewStatus: 'needs-review',
    },
  ],
  'mentor-task-4': [
    {
      id: 'mentor-task-4-sub-1',
      studentId: 'student-5',
      studentName: 'Luciana Vera',
      submittedAt: 'Apr 18, 2026 • 02:00 PM',
      grade: 10,
      reviewStatus: 'needs-review',
    },
  ],
};

// Roadmap Phases
export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1: Foundations',
    subtitle: 'Build the core design mindset and shared language.',
    progressLabel: '3 Modules • 10 Materials • 6 Tasks',
    modules: [
      {
        id: 'phase-1-module-1',
        title: 'Module 1: Visual Foundations',
        subtitle: 'Current journey',
        materials: [
          { id: 'm1-mat-1', title: 'Typography Scales Overview', type: 'video', duration: '12 min' },
          { id: 'm1-mat-2', title: 'Layout Rhythm Cheatsheet', type: 'reading', duration: '8 min' },
        ],
        tasks: [
          {
            id: 'rm-1',
            title: 'Typography Scales & Vertical Rhythm',
            subtitle: 'Mastering the editorial layout system.',
            status: 'completed',
          },
          {
            id: 'rm-2',
            title: 'Color Theory in Interface Design',
            subtitle: 'Harmonizing teal and purple palettes.',
            status: 'completed',
          },
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2: Application',
    subtitle: 'Turn fundamentals into structured, real interface work.',
    progressLabel: '2 Modules • 6 Materials • 4 Tasks',
    modules: [
      {
        id: 'phase-2-module-1',
        title: 'Module 1: Interface Systems',
        subtitle: 'Apply the design language in products.',
        materials: [],
        tasks: [],
      },
    ],
  },
];

// Mentor Roadmap Program
export const mentorRoadmapProgram = {
  title: 'Game Environment Design',
  description:
    'Master the art of creating immersive digital worlds, from initial block-out to high-fidelity lighting and texture work for modern game engines.',
  level: 'Intermediate',
  duration: '12 weeks',
};

// Mentor Roadmap Phases
export const mentorRoadmapPhasesData: MentorRoadmapPhase[] = [
  {
    id: 'mentor-roadmap-phase-1',
    title: 'Phase 1: Foundational Skills',
    modulesCount: 4,
    tasksCount: 15,
    modules: [
      {
        id: 'mentor-roadmap-phase-1-module-1',
        title: 'Module 1: Introduction to Maya & ZBrush',
        description:
          'Establish a professional workflow by mastering industry-standard 3D modeling and sculpting tools.',
        materials: ['Maya Interface Overview (Video)', 'ZBrush Sculpting Fundamentals (Article)'],
        assignments: ['Model a simple prop (e.g., crate)', 'Create a organic rock sculpt'],
      },
    ],
  },
  {
    id: 'mentor-roadmap-phase-2',
    title: 'Phase 2: Lighting & Composition',
    modulesCount: 3,
    tasksCount: 10,
    modules: [
      {
        id: 'mentor-roadmap-phase-2-module-1',
        title: 'Module 1: Cinematic Lighting Foundations',
        materials: [],
        assignments: [],
      },
    ],
  },
];

// Phase Theme Classes
export const phaseThemeClasses = [
  {
    accent: 'text-[#5E48C3]',
    badgeBg: 'bg-[#EEE8FF]',
    badgeText: 'text-[#5E48C3]',
    barFrom: 'from-[#6E56CF]',
    barTo: 'to-[#9A7BFF]',
    panelBorder: 'border-[#E7E0FF]',
    panelBg: 'bg-white',
    moduleBg: 'bg-white',
    materialBg: 'bg-white',
  },
  {
    accent: 'text-[#0E7A5F]',
    badgeBg: 'bg-[#DDF6F0]',
    badgeText: 'text-[#0E7A5F]',
    barFrom: 'from-[#11A37F]',
    barTo: 'to-[#59D6B7]',
    panelBorder: 'border-[#D9F6EE]',
    panelBg: 'bg-white',
    moduleBg: 'bg-white',
    materialBg: 'bg-white',
  },
  {
    accent: 'text-[#B86B00]',
    badgeBg: 'bg-[#FFF1D9]',
    badgeText: 'text-[#B86B00]',
    barFrom: 'from-[#E7A32C]',
    barTo: 'to-[#F4C45A]',
    panelBorder: 'border-[#F8E2B0]',
    panelBg: 'bg-white',
    moduleBg: 'bg-white',
    materialBg: 'bg-white',
  },
];

// Module Tabs
export const moduleTabs = [
  'Phase 1: Foundations',
  'Phase 2: Advanced UX',
  'Phase 3: Visual Identity',
  'Phase 4: Professional Kit',
];

// Constants
export const CLASSROOM_TABS = {
  CLASSROOM: 'classroom' as const,
  SCHEDULE: 'schedule' as const,
  ROADMAP: 'roadmap' as const,
  TASKS: 'tasks' as const,
  STUDENTS: 'students' as const,
};

export const TASK_STATUS = {
  TODO: 'todo' as const,
  SUBMITTED: 'submitted' as const,
  REVIEWED: 'reviewed' as const,
};

export const BADGE_TONES = {
  DANGER: 'danger' as const,
  SUCCESS: 'success' as const,
  NEUTRAL: 'neutral' as const,
};

export const TOAST_DURATION = 3000;
export const DELETE_TOAST_DURATION = 5000;
