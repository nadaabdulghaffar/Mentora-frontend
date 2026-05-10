import { useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  FileText,
  Image,
  Link2,
  Paperclip,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { FeedPostProps } from '../../components/Feed';
import authAPI from '../../services/authService';
import Layout from '../../shared/components/Layout';
import ClassroomTabsNav, { type ClassroomTab } from '../../components/classroom/ClassroomTabsNav';
import ClassroomOverviewSection from '../../components/classroom/ClassroomOverviewSection';
import ClassroomScheduleSection from '../../components/classroom/ClassroomScheduleSection';
import ClassroomMentorTasksSection from '../../components/classroom/ClassroomMentorTasksSection';
import ClassroomStudentsSection from '../../components/classroom/ClassroomStudentsSection';
import ClassroomRoadmapSection from '../../components/classroom/ClassroomRoadmapSection';
import TaskBadge from '../../components/classroom/TaskBadge.tsx';

type TaskStatus = 'todo' | 'submitted' | 'reviewed';

type ClassroomTask = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: TaskStatus;
  badge: string;
  badgeTone: 'danger' | 'success' | 'neutral';
  submissionDate?: string;
  submissionLinks?: StoredSubmissionLink[];
  mentorNotes?: string;
  summary?: string;
  deliverables?: string[];
  attachedResources?: TaskAttachedResource[];
};

type TaskAttachedResource = {
  id: string;
  title: string;
  link: string;
  type: 'pdf' | 'figma' | 'notion' | 'doc' | 'link';
  meta: string;
};

type StoredSubmissionLink = {
  id: string;
  title: string;
  url: string;
};

type SessionItem = {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  live: boolean;
};

type MentorWorkflowTask = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: 'done' | 'review' | 'risk';
  submissions: string;
  avgScore: number;
  avgLabel: string;
};

type MentorTaskPhase = {
  id: string;
  title: string;
  dotClass: string;
  milestonesLabel: string;
  tasks: MentorWorkflowTask[];
};

type MentorSubmissionRecord = {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  grade: number;
  reviewStatus: 'reviewed' | 'needs-review';
};

type MentorStudent = {
  id: string;
  name: string;
  email: string;
  statusLabel: string;
  statusTone: 'feedback' | 'idle' | 'active';
  moduleLabel: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  lastActive: string;
};

type RoadmapMaterial = {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'template';
  duration: string;
};

type RoadmapTask = {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'pending' | 'overdue';
};

type RoadmapModule = {
  id: string;
  title: string;
  subtitle: string;
  materials: RoadmapMaterial[];
  tasks: RoadmapTask[];
};

type RoadmapPhase = {
  id: string;
  title: string;
  subtitle: string;
  progressLabel: string;
  modules: RoadmapModule[];
};

type MentorRoadmapModule = {
  id: string;
  title: string;
  description?: string;
  materials: string[];
  assignments: string[];
};

type MentorRoadmapPhase = {
  id: string;
  title: string;
  modulesCount: number;
  tasksCount: number;
  modules: MentorRoadmapModule[];
};

type MentorRoadmapListType = 'materials' | 'assignments';

type NewTaskOrigin = {
  context: 'workflow' | 'composer' | 'roadmap';
  phaseId?: string;
  moduleId?: string;
  listType?: MentorRoadmapListType;
};

type AssignmentEditContext = {
  phaseId: string;
  moduleId: string;
  assignmentIndex: number;
};

type NewTaskResource = {
  id: string;
  title: string;
  url: string;
  isOpen: boolean;
};

type NewMaterialDraft = {
  id: string;
  type: 'article' | 'video';
  title: string;
  link: string;
  isOpen: boolean;
};

type NewModuleComposerDraft = {
  title: string;
  summary: string;
  materials: string[];
  tasks: string[];
};

type SubmissionLink = {
  id: string;
  title: string;
  url: string;
  isOpen: boolean;
};

const classroomFeedPosts: FeedPostProps[] = [
  {
    id: 'feed-1',
    authorId: 'mentor-1',
    authorName: 'Amina Hassan',
    authorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
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
    comments: [
      {
        id: 'feed-1-comment-1',
        authorId: 'mentee-4',
        authorName: 'Sarah Chen',
        authorAvatar: 'https://randomuser.me/api/portraits/women/54.jpg',
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
    authorAvatar: 'https://randomuser.me/api/portraits/women/54.jpg',
    content:
      "Has anyone found a good case study on the 'Zeigarnik Effect' applied to ed-tech dashboards? I want references for this week's mission.",
    timestamp: '5 hours ago',
    likes: 12,
    comments: [
      {
        id: 'feed-2-comment-1',
        authorId: 'mentee-8',
        authorName: 'Marcelo Thome',
        authorAvatar: 'https://randomuser.me/api/portraits/men/48.jpg',
        content: 'Check the Duolingo teardown on growth design. It covers incomplete cycles really well.',
        timestamp: '2 hours ago',
        likes: 3,
      },
    ],
    variant: 'classroom',
  },
];

const sessions: SessionItem[] = [
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

const mentorRoadmapProgram = {
  title: 'Game Environment Design',
  description:
    'Master the art of creating immersive digital worlds, from initial block-out to high-fidelity lighting and texture work for modern game engines.',
  level: 'Intermediate',
  duration: '12 weeks',
};

const mentorRoadmapPhasesData: MentorRoadmapPhase[] = [
  {
    id: 'mentor-roadmap-phase-1',
    title: 'Phase 1: Foundational Skills',
    modulesCount: 4,
    tasksCount: 15,
    modules: [
      {
        id: 'mentor-roadmap-phase-1-module-1',
        title: 'Module 1: Introduction to Maya & ZBrush',
        description: 'Establish a professional workflow by mastering industry-standard 3D modeling and sculpting tools.',
        materials: ['Maya Interface Overview (Video)', 'ZBrush Sculpting Fundamentals (Article)'],
        assignments: ['Model a simple prop (e.g., crate)', 'Create a organic rock sculpt'],
      },
      {
        id: 'mentor-roadmap-phase-1-module-2',
        title: 'Module 2: UV Unwrapping & Texturing Pipelines',
        materials: [],
        assignments: [],
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

const initialMentorStudents: MentorStudent[] = [
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

const mentorTaskSubmissions: Record<string, MentorSubmissionRecord[]> = {
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

const initialTasks: ClassroomTask[] = [
  {
    id: 'task-1',
    title: 'User Journey Mapping',
    category: 'UX RESEARCH',
    description: 'Synthesize interview data into a comprehensive journey map.',
    status: 'todo',
    badge: '1 Overdue',
    badgeTone: 'danger',
    summary:
      "Analyze emotional states during onboarding for 'Atelier Mobile' to align with the 'Aspiring Craftsman' persona. Highlight the moments of confusion, hesitation, and confidence across each step, then translate these findings into practical UX opportunities that improve clarity and progression.",
    deliverables: [
      'End-to-end user journey map (PDF/Link)',
      'Identification of 3 major onboarding friction points',
      'Actionable design solutions for each pain point',
    ],
    attachedResources: [
      {
        id: 'task-1-resource-1',
        title: 'Mapping_Template.pdf',
        link: 'https://example.com/mapping-template.pdf',
        type: 'pdf',
        meta: '2.4 MB',
      },
      {
        id: 'task-1-resource-2',
        title: 'Competitor Analysis',
        link: 'https://www.notion.so/atelier-competitor-analysis',
        type: 'notion',
        meta: 'Notion link',
      },
    ],
  },
  {
    id: 'task-2',
    title: 'Typography Systems',
    category: 'VISUAL DESIGN',
    description: 'Define the dual-type scale system for the Atelier brand identity.',
    status: 'todo',
    badge: 'Due in 2 days',
    badgeTone: 'neutral',
    summary:
      'Build a clear typography hierarchy for headings, body, and helper texts across the product pages. Define where each text style is used, ensure contrast and readability at different screen sizes, and document usage rules that keep the interface visually consistent.',
    deliverables: [
      'Define heading and body font scale',
      'Provide spacing and line-height system',
      'Share usage examples for dashboard views',
    ],
    attachedResources: [
      {
        id: 'task-2-resource-1',
        title: 'Type Scale Brief',
        link: 'https://example.com/type-scale-brief.docx',
        type: 'doc',
        meta: 'DOCX file',
      },
      {
        id: 'task-2-resource-2',
        title: 'Reference Board',
        link: 'https://www.figma.com/file/atelier-type-board',
        type: 'figma',
        meta: 'Figma file',
      },
    ],
  },
  {
    id: 'task-3',
    title: 'Sitemap & Information Architecture',
    category: 'ARCHITECTURE',
    description: 'Create structural map for the knowledge base resources.',
    status: 'submitted',
    badge: 'Under Review',
    badgeTone: 'success',
    submissionDate: 'Apr 17, 2026',
    submissionLinks: [
      {
        id: 'task-3-link-1',
        title: 'IA Final Sitemap',
        url: 'https://www.figma.com/file/atelier-ia-sitemap',
      },
    ],
    mentorNotes: 'I focused on simplifying the navigation structure and improving content grouping.',
  },
  {
    id: 'task-4',
    title: 'The Digital Atelier Persona',
    category: 'BRANDING',
    description: 'Create persona narratives and behavior assumptions.',
    status: 'reviewed',
    badge: 'Completed',
    badgeTone: 'success',
    submissionDate: 'Apr 15, 2026',
  },
];

const roadmapPhases: RoadmapPhase[] = [
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
          { id: 'm1-mat-3', title: 'Spacing System Template', type: 'template', duration: 'Download' },
        ],
        tasks: [
          { id: 'rm-1', title: 'Typography Scales & Vertical Rhythm', subtitle: 'Mastering the editorial layout system.', status: 'completed' },
          { id: 'rm-2', title: 'Color Theory in Interface Design', subtitle: 'Harmonizing teal and purple palettes.', status: 'completed' },
        ],
      },
      {
        id: 'phase-1-module-2',
        title: 'Module 2: Systemic Design',
        subtitle: 'Shape the rules behind the interface.',
        materials: [
          { id: 'm2-mat-1', title: 'Design Tokens 101', type: 'reading', duration: '9 min' },
          { id: 'm2-mat-2', title: 'Component Naming Pattern', type: 'template', duration: 'Download' },
        ],
        tasks: [
          { id: 'rm-3', title: 'Advanced Layout Logic', subtitle: 'The bento-box structural approach.', status: 'pending' },
          { id: 'rm-4', title: 'Component Atomic Structure', subtitle: 'Refining reusable UI anchors.', status: 'overdue' },
        ],
      },
      {
        id: 'phase-1-module-3',
        title: 'Module 3: Design Communication',
        subtitle: 'Translate ideas into a shared design story.',
        materials: [
          { id: 'm3-mat-1', title: 'Presentation Flow Walkthrough', type: 'video', duration: '10 min' },
          { id: 'm3-mat-2', title: 'Feedback Framing Guide', type: 'reading', duration: '6 min' },
        ],
        tasks: [
          { id: 'rm-5', title: 'Create a Design Critique Note', subtitle: 'Summarize one UI decision with rationale.', status: 'pending' },
          { id: 'rm-6', title: 'Prepare a 3-slide design story', subtitle: 'Outline the problem, direction, and outcome.', status: 'completed' },
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
        materials: [
          { id: 'p2-m1-mat-1', title: 'Dashboard Pattern Study', type: 'video', duration: '15 min' },
          { id: 'p2-m1-mat-2', title: 'Grid Strategy Examples', type: 'reading', duration: '11 min' },
        ],
        tasks: [
          { id: 'p2-task-1', title: 'Build a reusable dashboard header', subtitle: 'Focus on hierarchy and spacing consistency.', status: 'pending' },
          { id: 'p2-task-2', title: 'Create a component inventory', subtitle: 'List buttons, cards, and navigation elements.', status: 'completed' },
        ],
      },
      {
        id: 'phase-2-module-2',
        title: 'Module 2: Content & Collaboration',
        subtitle: 'Work with notes, feedback, and review loops.',
        materials: [
          { id: 'p2-m2-mat-1', title: 'Annotation Best Practices', type: 'reading', duration: '7 min' },
          { id: 'p2-m2-mat-2', title: 'Review Checklist Template', type: 'template', duration: 'Download' },
        ],
        tasks: [
          { id: 'p2-task-3', title: 'Write a critique response', subtitle: 'Reply to mentor feedback with a revision plan.', status: 'pending' },
          { id: 'p2-task-4', title: 'Document the design system', subtitle: 'Capture key patterns and naming rules.', status: 'completed' },
        ],
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3: Delivery',
    subtitle: 'Package, present, and ship the final work with confidence.',
    progressLabel: '1 Module • 3 Materials • 2 Tasks',
    modules: [
      {
        id: 'phase-3-module-1',
        title: 'Module 1: Final Presentation',
        subtitle: 'Close the loop and showcase outcomes.',
        materials: [
          { id: 'p3-m1-mat-1', title: 'Pitch Deck Structure', type: 'video', duration: '8 min' },
          { id: 'p3-m1-mat-2', title: 'Case Study Writing Guide', type: 'reading', duration: '10 min' },
          { id: 'p3-m1-mat-3', title: 'Delivery Checklist', type: 'template', duration: 'Download' },
        ],
        tasks: [
          { id: 'p3-task-1', title: 'Prepare the final walkthrough', subtitle: 'Walk through the design decisions end to end.', status: 'pending' },
          { id: 'p3-task-2', title: 'Submit the final case study', subtitle: 'Document results, learnings, and next steps.', status: 'overdue' },
        ],
      },
    ],
  },
];

const phaseThemeClasses = [
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

type ClassroomPageProps = {};

const ClassroomPage = ({}: ClassroomPageProps = {}) => {
  const user = authAPI.getCurrentUser();
  const role = user?.role?.toLowerCase?.()?.trim?.() || '';
  const isMentor = role === 'mentor';

  const moduleTabs = [
    'Phase 1: Foundations',
    'Phase 2: Advanced UX',
    'Phase 3: Visual Identity',
    'Phase 4: Professional Kit',
  ];

  const [activeTab, setActiveTab] = useState<ClassroomTab>('classroom');
  const [activeModuleTab, setActiveModuleTab] = useState(moduleTabs[0]);
  const [feedPosts, setFeedPosts] = useState<FeedPostProps[]>(classroomFeedPosts);
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<string[]>(() => roadmapPhases.map((phase) => phase.id));
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>(() => roadmapPhases.map((phase) => phase.modules[0]?.id).filter(Boolean) as string[]);
  const [showPostDiscussionModal, setShowPostDiscussionModal] = useState(false);
  const [discussionText, setDiscussionText] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showUpdateSubmissionModal, setShowUpdateSubmissionModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [showReviewTaskModal, setShowReviewTaskModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSubmitToast, setShowSubmitToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showSendFeedbackToast, setShowSendFeedbackToast] = useState(false);
  const [showRequestSubmissionToast, setShowRequestSubmissionToast] = useState(false);
  const [showMentorSubmissionsModal, setShowMentorSubmissionsModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskOrigin, setNewTaskOrigin] = useState<NewTaskOrigin>({ context: 'workflow' });
  const [selectedMentorTaskId, setSelectedMentorTaskId] = useState<string | null>(null);
  const [mentorSubmissionsFilter, setMentorSubmissionsFilter] = useState<'all' | 'reviewed' | 'needs-review'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState('Foundations');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [editingAssignmentContext, setEditingAssignmentContext] = useState<AssignmentEditContext | null>(null);
  const [assignmentDetailsByKey, setAssignmentDetailsByKey] = useState<
    Record<string, { description: string; deadline: string; link: string }>
  >({});
  const [addedMentorTasksByPhase, setAddedMentorTasksByPhase] = useState<Record<string, MentorWorkflowTask[]>>({});
  const [newTaskResources, setNewTaskResources] = useState<NewTaskResource[]>([
    {
      id: 'new-task-resource-1',
      title: '',
      url: '',
      isOpen: true,
    },
  ]);
  const [pendingDeleteStudent, setPendingDeleteStudent] = useState<MentorStudent | null>(null);
  const [lastDeletedStudent, setLastDeletedStudent] = useState<{ student: MentorStudent; index: number } | null>(null);
  const deleteToastTimeoutRef = useRef<number | null>(null);
  const [mentorStudents, setMentorStudents] = useState<MentorStudent[]>(initialMentorStudents);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [taskItems, setTaskItems] = useState<ClassroomTask[]>(initialTasks);
  const [selectedSubmitTaskId, setSelectedSubmitTaskId] = useState<string | null>(null);
  const [selectedSubmissionTaskId, setSelectedSubmissionTaskId] = useState<string | null>(null);
  const [selectedTaskDetailsId, setSelectedTaskDetailsId] = useState<string | null>(null);
  const [selectedReviewStudentId, setSelectedReviewStudentId] = useState<string | null>(null);
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [expandedMentorRoadmapPhaseIds, setExpandedMentorRoadmapPhaseIds] = useState<string[]>([
    'mentor-roadmap-phase-1',
  ]);
  const [expandedMentorRoadmapModuleIds, setExpandedMentorRoadmapModuleIds] = useState<string[]>([
    'mentor-roadmap-phase-1-module-1',
  ]);
  const [mentorRoadmapPhases, setMentorRoadmapPhases] = useState<MentorRoadmapPhase[]>(mentorRoadmapPhasesData);
  const [showAddMaterialsModal, setShowAddMaterialsModal] = useState(false);
  const [selectedAddMaterialsTarget, setSelectedAddMaterialsTarget] = useState<{
    context: 'roadmap' | 'composer';
    phaseId: string;
    listType: MentorRoadmapListType;
    moduleId?: string;
    editIndex?: number;
  } | null>(null);
  const [newMaterialDrafts, setNewMaterialDrafts] = useState<NewMaterialDraft[]>([]);
  const [newModuleComposerByPhase, setNewModuleComposerByPhase] = useState<
    Record<string, NewModuleComposerDraft>
  >({});
  const [expandedMentorPhaseIds, setExpandedMentorPhaseIds] = useState<string[]>([
    'mentor-phase-1',
    'mentor-phase-2',
    'mentor-phase-3',
  ]);
  const [checkedMaterialIds, setCheckedMaterialIds] = useState<string[]>([]);
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLinks, setSubmissionLinks] = useState<SubmissionLink[]>([
    {
      id: 'submission-link-1',
      title: '',
      url: '',
      isOpen: true,
    },
  ]);
  const [updateSubmissionLinks, setUpdateSubmissionLinks] = useState<SubmissionLink[]>([]);
  const [updateSubmissionNotes, setUpdateSubmissionNotes] = useState('');

  const closePostDiscussionModal = () => {
    setShowPostDiscussionModal(false);
    setDiscussionText('');
    setSelectedImageFile(null);
    setSelectedDocumentFile(null);
    setSelectedImageName('');
    setSelectedDocumentName('');
  };

  const handlePostDiscussion = () => {
    const trimmedContent = discussionText.trim();
    if (!trimmedContent) {
      return;
    }

    const attachments: FeedPostProps['attachments'] = [];

    if (selectedImageFile) {
      attachments.push({
        id: `attachment-image-${Date.now()}`,
        type: 'image',
        url: URL.createObjectURL(selectedImageFile),
      });
    }

    if (selectedDocumentFile) {
      attachments.push({
        id: `attachment-file-${Date.now()}`,
        type: 'file',
        url: '#',
        name: selectedDocumentFile.name,
      });
    }

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Designer';

    const newPost: FeedPostProps = {
      id: `feed-${Date.now()}`,
      authorId: user?.userId ? String(user.userId) : 'current-user',
      authorName: displayName,
      authorAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
      content: trimmedContent,
      timestamp: 'Just now',
      attachments,
      likes: 0,
      comments: [],
      variant: 'classroom',
    };

    setFeedPosts((prev) => [newPost, ...prev]);
    closePostDiscussionModal();
  };

  const addSubmissionLink = () => {
    const newLinkId = `submission-link-${Date.now()}`;

    setSubmissionLinks((prev) => [
      ...prev,
      {
        id: newLinkId,
        title: '',
        url: '',
        isOpen: true,
      },
    ]);
  };

  const toggleSubmissionLink = (linkId: string) => {
    setSubmissionLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, isOpen: !link.isOpen } : link)));
  };

  const updateSubmissionLink = (linkId: string, field: 'title' | 'url', value: string) => {
    setSubmissionLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, [field]: value } : link)));
  };

  const removeSubmissionLink = (linkId: string) => {
    setSubmissionLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  const openSubmitModalForTask = (taskId: string) => {
    const activeTask = taskItems.find((task) => task.id === taskId);

    setSelectedSubmitTaskId(taskId);
    setSubmissionLinks(
      activeTask?.submissionLinks?.length
        ? activeTask.submissionLinks.map((link) => ({ ...link, isOpen: true }))
        : [
            {
              id: `submission-link-${Date.now()}`,
              title: '',
              url: '',
              isOpen: true,
            },
          ]
    );
    setSubmissionNotes(activeTask?.mentorNotes ?? '');
    setShowSubmitModal(true);
  };

  const normalizeSubmissionLinks = (links: SubmissionLink[]): StoredSubmissionLink[] =>
    links
      .map((link) => ({
        id: link.id,
        title: link.title.trim(),
        url: link.url.trim(),
      }))
      .filter((link) => link.title || link.url);

  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedSubmitTaskId(null);
    setSubmissionNotes('');
    setSubmissionLinks([
      {
        id: 'submission-link-1',
        title: '',
        url: '',
        isOpen: true,
      },
    ]);
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSelectedSubmissionTaskId(null);
  };

  const openTaskDetailsModal = (taskId: string) => {
    setSelectedTaskDetailsId(taskId);
    setShowTaskDetailsModal(true);
  };

  const closeTaskDetailsModal = () => {
    setShowTaskDetailsModal(false);
    setSelectedTaskDetailsId(null);
  };

  const openReviewTaskModal = (studentId: string) => {
    setSelectedReviewStudentId(studentId);
    setReviewGrade('');
    setReviewFeedback('');
    setShowReviewTaskModal(true);
  };

  const closeReviewTaskModal = () => {
    setShowReviewTaskModal(false);
    setSelectedReviewStudentId(null);
  };

  const handleSendFeedback = () => {
    closeReviewTaskModal();
    setShowSendFeedbackToast(true);

    setTimeout(() => {
      setShowSendFeedbackToast(false);
    }, 3000);
  };

  const handleRequestSubmission = () => {
    closeReviewTaskModal();
    setShowRequestSubmissionToast(true);

    setTimeout(() => {
      setShowRequestSubmissionToast(false);
    }, 3000);
  };

  const openMentorSubmissionsModal = (taskId: string, filter: 'all' | 'reviewed' | 'needs-review' = 'all') => {
    setSelectedMentorTaskId(taskId);
    setMentorSubmissionsFilter(filter);
    setShowMentorSubmissionsModal(true);
  };

  const openMentorSubmissionsForStudent = (studentId: string) => {
    const matchedTaskId = Object.entries(mentorTaskSubmissions).find(([, submissions]) =>
      submissions.some((submission) => submission.studentId === studentId)
    )?.[0];

    if (!matchedTaskId) {
      return;
    }

    openMentorSubmissionsModal(matchedTaskId, 'needs-review');
  };

  const openReviewStudentFromSubmissions = (studentId: string) => {
    openReviewTaskModal(studentId);
  };

  const closeMentorSubmissionsModal = () => {
    setShowMentorSubmissionsModal(false);
    setSelectedMentorTaskId(null);
    setMentorSubmissionsFilter('all');
  };

  const resetNewTaskForm = (phase: string = 'Foundations') => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPhase(phase);
    setNewTaskDeadline('');
    setNewTaskResources([
      {
        id: 'new-task-resource-1',
        title: '',
        url: '',
        isOpen: true,
      },
    ]);
    setEditingAssignmentContext(null);
  };

  const openNewTaskModal = (phase: string = 'Foundations', origin: NewTaskOrigin = { context: 'workflow' }) => {
    resetNewTaskForm(phase);
    setNewTaskOrigin(origin);
    setShowNewTaskModal(true);
  };

  const getRoadmapTaskPhase = (phaseTitle: string) => {
    if (phaseTitle.includes('Foundational')) {
      return 'Foundations';
    }

    if (phaseTitle.includes('UX')) {
      return 'Advanced UX';
    }

    if (phaseTitle.includes('Visual')) {
      return 'Visual Systems';
    }

    return 'Foundations';
  };

  const closeNewTaskModal = () => {
    setShowNewTaskModal(false);
    setNewTaskOrigin({ context: 'workflow' });
    resetNewTaskForm();
  };

  const getAssignmentKey = (phaseId: string, moduleId: string, assignmentIndex: number) =>
    `${phaseId}::${moduleId}::${assignmentIndex}`;

  const parseAssignmentValue = (assignmentValue: string) => {
    const parts = assignmentValue.split(' - ');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim();
      if (/^https?:\/\//i.test(lastPart)) {
        return {
          title: parts.slice(0, -1).join(' - ').trim(),
          link: lastPart,
        };
      }
    }

    return {
      title: assignmentValue.trim(),
      link: '',
    };
  };

  const openEditAssignmentTaskModal = (
    phaseId: string,
    moduleId: string,
    assignmentIndex: number
  ) => {
    const targetPhase = mentorRoadmapPhases.find((phase) => phase.id === phaseId);
    const targetModule = targetPhase?.modules.find((module) => module.id === moduleId);
    const currentAssignment = targetModule?.assignments?.[assignmentIndex];

    if (!currentAssignment) {
      return;
    }

    const assignmentKey = getAssignmentKey(phaseId, moduleId, assignmentIndex);
    const parsedValue = parseAssignmentValue(currentAssignment);
    const storedDetails = assignmentDetailsByKey[assignmentKey];
    const effectiveLink = storedDetails?.link || parsedValue.link;

    setEditingAssignmentContext({ phaseId, moduleId, assignmentIndex });
    setNewTaskTitle(parsedValue.title);
    setNewTaskDescription(storedDetails?.description ?? '');
    setNewTaskDeadline(storedDetails?.deadline ?? '');
    setNewTaskPhase('Foundations');
    setNewTaskResources([
      {
        id: `new-task-resource-${Date.now()}`,
        title: effectiveLink ? 'Assignment link' : '',
        url: effectiveLink,
        isOpen: true,
      },
    ]);
    setShowNewTaskModal(true);
  };

  const handlePublishNewTask = () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    if (editingAssignmentContext) {
      const firstLink = newTaskResources
        .map((resource) => resource.url.trim())
        .find((url) => url.length > 0) || '';

      const assignmentValue = firstLink ? `${trimmedTitle} - ${firstLink}` : trimmedTitle;

      setMentorRoadmapPhases((prev) =>
        prev.map((phase) => {
          if (phase.id !== editingAssignmentContext.phaseId) {
            return phase;
          }

          return {
            ...phase,
            modules: phase.modules.map((module) => {
              if (module.id !== editingAssignmentContext.moduleId) {
                return module;
              }

              const updatedAssignments = [...module.assignments];
              updatedAssignments[editingAssignmentContext.assignmentIndex] = assignmentValue;

              return {
                ...module,
                assignments: updatedAssignments,
              };
            }),
          };
        })
      );

      setAssignmentDetailsByKey((prev) => ({
        ...prev,
        [getAssignmentKey(
          editingAssignmentContext.phaseId,
          editingAssignmentContext.moduleId,
          editingAssignmentContext.assignmentIndex
        )]: {
          description: newTaskDescription.trim(),
          deadline: newTaskDeadline,
          link: firstLink,
        },
      }));

      closeNewTaskModal();
      return;
    }

    if (newTaskOrigin.context === 'composer' && newTaskOrigin.phaseId) {
      setNewModuleComposerByPhase((prev) => {
        const current = prev[newTaskOrigin.phaseId!] ?? getDefaultNewModuleComposer();

        return {
          ...prev,
          [newTaskOrigin.phaseId!]: {
            ...current,
            tasks: [...current.tasks, trimmedTitle],
          },
        };
      });

      closeNewTaskModal();
      return;
    }

    const selectedPhase = mentorTaskPhases.find((phase) => phase.title === newTaskPhase);
    if (!selectedPhase) {
      return;
    }

    const newTask: MentorWorkflowTask = {
      id: `mentor-task-${Date.now()}`,
      title: trimmedTitle,
      description: newTaskDescription.trim() || 'No description provided yet.',
      statusLabel: 'Requires review for next step',
      statusTone: 'review',
      submissions: '0/0',
      avgScore: 0,
      avgLabel: 'Average score',
    };

    setAddedMentorTasksByPhase((prev) => ({
      ...prev,
      [selectedPhase.id]: [...(prev[selectedPhase.id] ?? []), newTask],
    }));

    setExpandedMentorPhaseIds((current) =>
      current.includes(selectedPhase.id) ? current : [...current, selectedPhase.id]
    );

    closeNewTaskModal();
  };

  const addNewTaskResource = () => {
    setNewTaskResources((prev) => [
      ...prev,
      {
        id: `new-task-resource-${Date.now()}`,
        title: '',
        url: '',
        isOpen: true,
      },
    ]);
  };

  const toggleNewTaskResource = (resourceId: string) => {
    setNewTaskResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId ? { ...resource, isOpen: !resource.isOpen } : resource
      )
    );
  };

  const updateNewTaskResource = (resourceId: string, field: 'title' | 'url', value: string) => {
    setNewTaskResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId ? { ...resource, [field]: value } : resource
      )
    );
  };

  const removeNewTaskResource = (resourceId: string) => {
    setNewTaskResources((prev) => prev.filter((resource) => resource.id !== resourceId));
  };

  const handleConfirmSubmission = () => {
    if (selectedSubmitTaskId) {
      const submittedOn = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      setTaskItems((prev) =>
        prev.map((task) =>
          task.id === selectedSubmitTaskId
            ? {
                ...task,
                status: 'submitted',
                badge: 'Under Review',
                badgeTone: 'success',
                submissionDate: submittedOn,
                submissionLinks: normalizeSubmissionLinks(submissionLinks),
                mentorNotes: submissionNotes.trim(),
              }
            : task
        )
      );
    }

    closeSubmitModal();
    setShowSubmitToast(true);
    setTimeout(() => {
      setShowSubmitToast(false);
    }, 3000);
  };

  const selectedSubmissionTask = useMemo(
    () => taskItems.find((task) => task.id === selectedSubmissionTaskId) ?? null,
    [taskItems, selectedSubmissionTaskId]
  );

  const selectedTaskDetails = useMemo(
    () => taskItems.find((task) => task.id === selectedTaskDetailsId) ?? null,
    [taskItems, selectedTaskDetailsId]
  );

  const selectedReviewStudent = useMemo(
    () => mentorStudents.find((student) => student.id === selectedReviewStudentId) ?? null,
    [mentorStudents, selectedReviewStudentId]
  );

  const getAttachedResourceIconClasses = (type: TaskAttachedResource['type']) => {
    if (type === 'pdf') {
      return {
        wrapper: 'bg-[#FFEAE7]',
        icon: 'text-[#B84031]',
      };
    }

    if (type === 'figma') {
      return {
        wrapper: 'bg-[#F0E9FF]',
        icon: 'text-[#6940C8]',
      };
    }

    if (type === 'notion') {
      return {
        wrapper: 'bg-[#E8F6F3]',
        icon: 'text-[#147D70]',
      };
    }

    if (type === 'doc') {
      return {
        wrapper: 'bg-[#EAF1FF]',
        icon: 'text-[#2C5CC4]',
      };
    }

    return {
      wrapper: 'bg-[#EFF2F7]',
      icon: 'text-[#586177]',
    };
  };

  const openUpdateSubmissionModal = () => {
    if (!selectedSubmissionTask) {
      return;
    }

    setUpdateSubmissionLinks(
      selectedSubmissionTask.submissionLinks?.length
        ? selectedSubmissionTask.submissionLinks.map((link) => ({ ...link, isOpen: true }))
        : [
            {
              id: `submission-link-${Date.now()}`,
              title: '',
              url: '',
              isOpen: true,
            },
          ]
    );
    setUpdateSubmissionNotes(selectedSubmissionTask.mentorNotes ?? '');
    setShowUpdateSubmissionModal(true);
  };

  const addUpdateSubmissionLink = () => {
    setUpdateSubmissionLinks((prev) => [
      ...prev,
      {
        id: `submission-link-${Date.now()}`,
        title: '',
        url: '',
        isOpen: true,
      },
    ]);
  };

  const toggleUpdateSubmissionLink = (linkId: string) => {
    setUpdateSubmissionLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, isOpen: !link.isOpen } : link)));
  };

  const updateExistingSubmissionLink = (linkId: string, field: 'title' | 'url', value: string) => {
    setUpdateSubmissionLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, [field]: value } : link)));
  };

  const removeUpdateSubmissionLink = (linkId: string) => {
    setUpdateSubmissionLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  const handleSaveUpdatedSubmission = () => {
    if (!selectedSubmissionTaskId) {
      return;
    }

    setTaskItems((prev) =>
      prev.map((task) =>
        task.id === selectedSubmissionTaskId
          ? {
              ...task,
              submissionLinks: normalizeSubmissionLinks(updateSubmissionLinks),
              mentorNotes: updateSubmissionNotes.trim(),
            }
          : task
      )
    );

    setShowUpdateSubmissionModal(false);
    setShowUpdateToast(true);
    setTimeout(() => {
      setShowUpdateToast(false);
    }, 3000);
  };

  const isAllStudentsSelected = mentorStudents.length > 0 && selectedStudentIds.length === mentorStudents.length;

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleSelectAllStudents = () => {
    setSelectedStudentIds((prev) => (prev.length === mentorStudents.length ? [] : mentorStudents.map((student) => student.id)));
  };

  const deleteSelectedStudents = () => {
    if (selectedStudentIds.length === 0) {
      return;
    }

    setMentorStudents((prev) => prev.filter((student) => !selectedStudentIds.includes(student.id)));
    setSelectedStudentIds([]);
  };

  const deleteStudentById = (studentId: string) => {
    setMentorStudents((prev) => prev.filter((student) => student.id !== studentId));
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  const requestDeleteStudent = (student: MentorStudent) => {
    setPendingDeleteStudent(student);
  };

  const closeDeleteStudentModal = () => {
    setPendingDeleteStudent(null);
  };

  const clearDeleteToastTimeout = () => {
    if (deleteToastTimeoutRef.current !== null) {
      clearTimeout(deleteToastTimeoutRef.current);
      deleteToastTimeoutRef.current = null;
    }
  };

  const undoDeleteStudent = () => {
    if (!lastDeletedStudent) {
      return;
    }

    setMentorStudents((prev) => {
      const next = [...prev];
      const insertAt = Math.min(lastDeletedStudent.index, next.length);
      next.splice(insertAt, 0, lastDeletedStudent.student);
      return next;
    });

    setShowDeleteToast(false);
    setLastDeletedStudent(null);
    clearDeleteToastTimeout();
  };

  const confirmDeleteStudent = () => {
    if (!pendingDeleteStudent) {
      return;
    }

    const deletedIndex = mentorStudents.findIndex((student) => student.id === pendingDeleteStudent.id);
    if (deletedIndex === -1) {
      closeDeleteStudentModal();
      return;
    }

    clearDeleteToastTimeout();
    setLastDeletedStudent({ student: pendingDeleteStudent, index: deletedIndex });

    deleteStudentById(pendingDeleteStudent.id);
    closeDeleteStudentModal();
    setShowDeleteToast(true);

    deleteToastTimeoutRef.current = window.setTimeout(() => {
      setShowDeleteToast(false);
      setLastDeletedStudent(null);
      deleteToastTimeoutRef.current = null;
    }, 5000);
  };

  const tabs = useMemo(
    () =>
      isMentor
        ? [
            { id: 'classroom' as const, label: 'Classroom' },
            { id: 'schedule' as const, label: 'Schedule' },
            { id: 'roadmap' as const, label: 'Roadmap' },
            { id: 'tasks' as const, label: 'Tasks' },
            { id: 'students' as const, label: 'Students' },
          ]
        : [
            { id: 'classroom' as const, label: 'Classroom' },
            { id: 'schedule' as const, label: 'Schedule' },
            { id: 'roadmap' as const, label: 'Roadmap' },
            { id: 'tasks' as const, label: 'Tasks' },
          ],
    [isMentor]
  );

  const todoTasks = taskItems.filter((task) => task.status === 'todo');
  const submittedTasks = taskItems.filter((task) => task.status === 'submitted');
  const reviewedTasks = taskItems.filter((task) => task.status === 'reviewed');

  const mentorTaskPhases: MentorTaskPhase[] = [
    {
      id: 'mentor-phase-1',
      title: 'Foundations',
      dotClass: 'bg-[#0B8A73]',
      milestonesLabel: '2 Milestones',
      tasks: [
        {
          id: 'mentor-task-1',
          title: 'Finalize Core Visual Guidelines',
          description: 'Establish the fundamental visual language and principles for the project.',
          statusLabel: 'Milestone Achieved',
          statusTone: 'done' as const,
          submissions: '42/45',
          avgScore: 91,
          avgLabel: 'Average score',
        },
        {
          id: 'mentor-task-2',
          title: 'Deliver Brand Typography Style Guide',
          description: 'Documenting all typography hierarchy and systematic scale implementation.',
          statusLabel: 'Requires review for next step',
          statusTone: 'review' as const,
          submissions: '38/45',
          avgScore: 88,
          avgLabel: 'Average score',
        },
      ],
    },
    {
      id: 'mentor-phase-2',
      title: 'Advanced UX',
      dotClass: 'bg-[#6E56CF]',
      milestonesLabel: '2 Milestones',
      tasks: [
        {
          id: 'mentor-task-3',
          title: 'Deliver Wireframe Prototype',
          description: 'Complete functional prototype demonstrating complex interaction logic and flows.',
          statusLabel: 'Requires review for next step',
          statusTone: 'review' as const,
          submissions: '12/45',
          avgScore: 27,
          avgLabel: 'Average score',
        },
        {
          id: 'mentor-task-4',
          title: 'Conduct Usability Study & Map Personas',
          description: 'Comprehensive user research findings translated into actionable persona mappings.',
          statusLabel: 'Requires review for next step',
          statusTone: 'risk' as const,
          submissions: '2/45',
          avgScore: 10,
          avgLabel: 'Average score',
        },
      ],
    },
    {
      id: 'mentor-phase-3',
      title: 'Visual Systems',
      dotClass: 'bg-[#B9692E]',
      milestonesLabel: 'Planned',
      tasks: [],
    },
  ];

  const mentorTaskPhasesView = mentorTaskPhases.map((phase) => ({
    ...phase,
    tasks: [...phase.tasks, ...(addedMentorTasksByPhase[phase.id] ?? [])],
  }));

  const mentorRegistryRows: Array<{
    id: string;
    title: string;
    subtitle: string;
    phase: string;
    submissions: string;
    avgScore: number;
    statusLabel: string;
    statusTone: 'done' | 'neutral';
  }> = mentorTaskPhasesView.flatMap((phase) =>
    phase.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      subtitle: `${phase.title} Module`,
      phase: phase.title,
      submissions: task.submissions,
      avgScore: task.avgScore,
      statusLabel: task.avgScore >= 85 ? 'Done' : 'Still running',
      statusTone: task.avgScore >= 85 ? 'done' : 'neutral',
    }))
  );

  const selectedMentorTask = useMemo(
    () => mentorTaskPhasesView.flatMap((phase) => phase.tasks).find((task) => task.id === selectedMentorTaskId) ?? null,
    [selectedMentorTaskId, mentorTaskPhasesView]
  );

  const selectedMentorTaskSubmissions = useMemo(
    () => (selectedMentorTaskId ? mentorTaskSubmissions[selectedMentorTaskId] ?? [] : []),
    [selectedMentorTaskId]
  );

  const showGradeColumn = mentorSubmissionsFilter !== 'needs-review';
  const showReviewActionColumn = mentorSubmissionsFilter !== 'reviewed';

  const filteredMentorTaskSubmissions = useMemo(() => {
    if (mentorSubmissionsFilter === 'all') {
      return selectedMentorTaskSubmissions;
    }

    return selectedMentorTaskSubmissions.filter((submission) => submission.reviewStatus === mentorSubmissionsFilter);
  }, [mentorSubmissionsFilter, selectedMentorTaskSubmissions]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhaseIds((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId]
    );
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModuleIds((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]
    );
  };

  const toggleMentorTaskPhase = (phaseId: string) => {
    setExpandedMentorPhaseIds((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId]
    );
  };

  const toggleMentorRoadmapPhase = (phaseId: string) => {
    setExpandedMentorRoadmapPhaseIds((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId]
    );
  };

  const toggleMentorRoadmapModule = (moduleId: string) => {
    setExpandedMentorRoadmapModuleIds((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]
    );
  };

  const collapseAllMentorRoadmapSections = () => {
    setExpandedMentorRoadmapPhaseIds([]);
    setExpandedMentorRoadmapModuleIds([]);
  };

  const createNewMaterialDraft = (type: 'article' | 'video' = 'article'): NewMaterialDraft => ({
    id: `material-draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: '',
    link: '',
    isOpen: true,
  });

  const parseRoadmapItemToDraft = (
    itemValue: string,
    listType: MentorRoadmapListType
  ): NewMaterialDraft => {
    const parts = itemValue.split(' - ');
    let labelPart = itemValue.trim();
    let linkPart = '';

    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim();
      if (/^https?:\/\//i.test(lastPart)) {
        linkPart = lastPart;
        labelPart = parts.slice(0, -1).join(' - ').trim();
      }
    }

    let detectedType: 'article' | 'video' = 'article';
    let titlePart = labelPart;

    if (listType === 'materials') {
      const typeMatch = labelPart.match(/^(.*)\((Article|Video)\)\s*$/i);
      if (typeMatch) {
        titlePart = typeMatch[1].trim();
        detectedType = typeMatch[2].toLowerCase() === 'video' ? 'video' : 'article';
      }
    }

    return {
      ...createNewMaterialDraft(detectedType),
      title: titlePart,
      link: linkPart,
      isOpen: true,
    };
  };

  const openAddMaterialsModal = (
    phaseId: string,
    moduleId: string,
    listType: MentorRoadmapListType = 'materials'
  ) => {
    setSelectedAddMaterialsTarget({ context: 'roadmap', phaseId, moduleId, listType });
    setNewMaterialDrafts([createNewMaterialDraft('article'), createNewMaterialDraft('video')]);
    setShowAddMaterialsModal(true);
  };

  const openComposerAddMaterialsModal = (phaseId: string) => {
    setSelectedAddMaterialsTarget({ context: 'composer', phaseId, listType: 'materials' });
    setNewMaterialDrafts([createNewMaterialDraft('article'), createNewMaterialDraft('video')]);
    setShowAddMaterialsModal(true);
  };

  const openEditRoadmapItemModal = (
    phaseId: string,
    moduleId: string,
    listType: MentorRoadmapListType,
    itemIndex: number
  ) => {
    const targetPhase = mentorRoadmapPhases.find((phase) => phase.id === phaseId);
    const targetModule = targetPhase?.modules.find((module) => module.id === moduleId);
    const currentValue = targetModule?.[listType]?.[itemIndex];

    if (!currentValue) {
      return;
    }

    setSelectedAddMaterialsTarget({ context: 'roadmap', phaseId, moduleId, listType, editIndex: itemIndex });
    setNewMaterialDrafts([parseRoadmapItemToDraft(currentValue, listType)]);
    setShowAddMaterialsModal(true);
  };

  const closeAddMaterialsModal = () => {
    setShowAddMaterialsModal(false);
    setSelectedAddMaterialsTarget(null);
    setNewMaterialDrafts([]);
  };

  const addAnotherMaterialDraft = () => {
    setNewMaterialDrafts((prev) => [...prev, createNewMaterialDraft('article')]);
  };

  const updateMaterialDraft = (
    draftId: string,
    field: 'type' | 'title' | 'link',
    value: string
  ) => {
    setNewMaterialDrafts((prev) =>
      prev.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              [field]: value,
            }
          : draft
      )
    );
  };

  const toggleMaterialDraft = (draftId: string) => {
    setNewMaterialDrafts((prev) =>
      prev.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              isOpen: !draft.isOpen,
            }
          : draft
      )
    );
  };

  const deleteMaterialDraft = (draftId: string) => {
    setNewMaterialDrafts((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((draft) => draft.id !== draftId);
    });
  };

  const formatRoadmapDraftForList = (
    draft: NewMaterialDraft,
    listType: MentorRoadmapListType
  ): string | null => {
    const title = draft.title.trim();
    const link = draft.link.trim();

    if (!title && !link) {
      return null;
    }

    const baseLabel = title || link;

    if (listType === 'materials') {
      const normalizedType = draft.type === 'video' ? 'Video' : 'Article';
      return link ? `${baseLabel} (${normalizedType}) - ${link}` : `${baseLabel} (${normalizedType})`;
    }

    return link ? `${baseLabel} - ${link}` : baseLabel;
  };

  const saveAllNewMaterials = () => {
    if (!selectedAddMaterialsTarget) {
      return;
    }

    const { context, phaseId, moduleId, listType, editIndex } = selectedAddMaterialsTarget;

    const preparedMaterials = newMaterialDrafts
      .map((draft) => formatRoadmapDraftForList(draft, listType))
      .filter((item): item is string => Boolean(item));

    if (preparedMaterials.length === 0) {
      return;
    }

    if (context === 'composer') {
      setNewModuleComposerByPhase((prev) => {
        const current = prev[phaseId] ?? getDefaultNewModuleComposer();

        return {
          ...prev,
          [phaseId]: {
            ...current,
            materials: [...current.materials, ...preparedMaterials],
          },
        };
      });

      closeAddMaterialsModal();
      return;
    }

    if (!moduleId) {
      return;
    }

    setMentorRoadmapPhases((prev) =>
      prev.map((phase) => {
        if (phase.id !== phaseId) {
          return phase;
        }

        return {
          ...phase,
          modules: phase.modules.map((module) => {
            if (module.id !== moduleId) {
              return module;
            }

            if (editIndex !== undefined) {
              const updatedItems = [...module[listType]];
              updatedItems[editIndex] = preparedMaterials[0];

              return {
                ...module,
                [listType]: updatedItems,
              };
            }

            return {
              ...module,
              [listType]: [...module[listType], ...preparedMaterials],
            };
          }),
        };
      })
    );

    setExpandedMentorRoadmapPhaseIds((current) =>
      current.includes(phaseId)
        ? current
        : [...current, phaseId]
    );
    setExpandedMentorRoadmapModuleIds((current) =>
      current.includes(moduleId)
        ? current
        : [...current, moduleId]
    );

    closeAddMaterialsModal();
  };

  const isEditingRoadmapItem =
    selectedAddMaterialsTarget?.context === 'roadmap' && selectedAddMaterialsTarget.editIndex !== undefined;
  const activeRoadmapModalListType: MentorRoadmapListType =
    selectedAddMaterialsTarget?.listType ?? 'materials';
  const addMaterialsModalTitle = isEditingRoadmapItem
    ? activeRoadmapModalListType === 'materials'
      ? 'Edit Material'
      : 'Edit Assignment'
    : activeRoadmapModalListType === 'materials'
      ? 'Add Materials'
      : 'Add Assignments';
  const addMaterialsPrimaryButtonLabel = isEditingRoadmapItem ? 'Save Changes' : 'Save All';
  const addMaterialsDraftLabel = activeRoadmapModalListType === 'materials' ? 'Material' : 'Assignment';

  const canSaveNewMaterials = newMaterialDrafts.some(
    (draft) => draft.title.trim().length > 0 || draft.link.trim().length > 0
  );

  const getDefaultNewModuleComposer = (): NewModuleComposerDraft => ({
    title: '',
    summary: '',
    materials: [],
    tasks: [],
  });

  const isNewModuleComposerOpen = (phaseId: string) => Boolean(newModuleComposerByPhase[phaseId]);

  const toggleNewModuleComposer = (phaseId: string) => {
    setNewModuleComposerByPhase((prev) => {
      if (prev[phaseId]) {
        const updated = { ...prev };
        delete updated[phaseId];
        return updated;
      }

      return {
        ...prev,
        [phaseId]: getDefaultNewModuleComposer(),
      };
    });
  };

  const updateNewModuleComposerField = (
    phaseId: string,
    field: 'title' | 'summary',
    value: string
  ) => {
    setNewModuleComposerByPhase((prev) => {
      const current = prev[phaseId] ?? getDefaultNewModuleComposer();
      return {
        ...prev,
        [phaseId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const updateNewModuleComposerItem = (
    phaseId: string,
    listType: 'materials' | 'tasks',
    index: number,
    value: string
  ) => {
    setNewModuleComposerByPhase((prev) => {
      const current = prev[phaseId] ?? getDefaultNewModuleComposer();
      const updatedList = [...current[listType]];
      updatedList[index] = value;

      return {
        ...prev,
        [phaseId]: {
          ...current,
          [listType]: updatedList,
        },
      };
    });
  };

  const removeNewModuleComposerItem = (
    phaseId: string,
    listType: 'materials' | 'tasks',
    index: number
  ) => {
    setNewModuleComposerByPhase((prev) => {
      const current = prev[phaseId] ?? getDefaultNewModuleComposer();
      return {
        ...prev,
        [phaseId]: {
          ...current,
          [listType]: current[listType].filter((_, itemIndex) => itemIndex !== index),
        },
      };
    });
  };

  const deleteMentorRoadmapItem = (
    phaseId: string,
    moduleId: string,
    listType: 'materials' | 'assignments',
    itemIndex: number
  ) => {
    setMentorRoadmapPhases((prev) =>
      prev.map((phase) => {
        if (phase.id !== phaseId) {
          return phase;
        }

        return {
          ...phase,
          modules: phase.modules.map((module) => {
            if (module.id !== moduleId) {
              return module;
            }

            return {
              ...module,
              [listType]: module[listType].filter((_, index) => index !== itemIndex),
            };
          }),
        };
      })
    );
  };

  const toggleMaterialCheck = (materialId: string) => {
    setCheckedMaterialIds((current) =>
      current.includes(materialId) ? current.filter((id) => id !== materialId) : [...current, materialId]
    );
  };

  const toggleTaskCheck = (taskId: string) => {
    setCheckedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]
    );
  };

  const getTaskProgressPercent = (tasksList: RoadmapTask[]) => {
    if (tasksList.length === 0) {
      return 0;
    }

    const completedTasks = tasksList.filter((task) => task.status === 'completed').length;
    return Math.round((completedTasks / tasksList.length) * 100);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <section className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[28px] font-bold leading-tight text-[#1F2432]">The Digital Atelier</p>
            </div>
          </div>

          <ClassroomTabsNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </section>

        {activeTab === 'classroom' && (
          <ClassroomOverviewSection
            onSubmitTask={() => openSubmitModalForTask('task-1')}
            onAddPost={() => setShowPostDiscussionModal(true)}
            feedPosts={feedPosts}
          />
        )}

        {activeTab === 'schedule' && <ClassroomScheduleSection sessions={sessions} />}

        {activeTab === 'tasks' && (
          <section className="space-y-5">
            {isMentor ? (
              <ClassroomMentorTasksSection
                mentorTaskPhasesView={mentorTaskPhasesView}
                expandedMentorPhaseIds={expandedMentorPhaseIds}
                onTogglePhase={toggleMentorTaskPhase}
                onAddTask={openNewTaskModal}
                onOpenSubmissions={openMentorSubmissionsModal}
                mentorRegistryRows={mentorRegistryRows}
              />
            ) : (
              <>
                <div>
                  <h1 className="text-3xl font-bold leading-tight text-[#1F2432]">Your Tasks</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {moduleTabs.map((moduleTab) => {
                    const isActive = activeModuleTab === moduleTab;

                    return (
                      <button
                        key={moduleTab}
                        type="button"
                        onClick={() => setActiveModuleTab(moduleTab)}
                        className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          isActive
                            ? 'border border-[#E6E9F2] bg-white text-[#5B45BE] shadow-[0_1px_2px_rgba(17,24,39,0.06)]'
                            : 'text-[#8A9099]'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#5B45BE]' : 'bg-[#9AA1AA]'}`} />
                        {moduleTab}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="space-y-3 rounded-2xl border border-[#E6E9F2] bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-[#2A3142]">To Do <span className="ml-1 rounded-full bg-[#EEE8FF] px-2 py-0.5 text-xs text-[#5B45BE]">{todoTasks.length}</span></p>
                      <button type="button" className="text-[#8B92A5]">...</button>
                    </div>
                    {todoTasks.map((task) => (
                      <div key={task.id} className="rounded-xl border border-[#EAEDF5] bg-[#FCFCFE] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-full bg-[#F2F0FF] px-2 py-1 text-[10px] font-semibold text-[#6C5CCB]">{task.category}</span>
                          <TaskBadge label={task.badge} tone={task.badgeTone} />
                        </div>
                        <p className="text-xl font-semibold leading-tight text-[#1F2433]">{task.title}</p>
                        <p className="mt-1 text-sm text-[#6E7589]">{task.description}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => openTaskDetailsModal(task.id)}
                            className="inline-flex h-10 items-center rounded-xl border border-[#CBD1DE] bg-white px-4 text-sm font-semibold text-[#4F5872]"
                          >
                            View task details
                          </button>
                          <button
                            type="button"
                            onClick={() => openSubmitModalForTask(task.id)}
                            className="inline-flex h-10 w-fit items-center rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white"
                          >
                            Submit Task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[#E6E9F2] bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-[#2A3142]">Submitted <span className="ml-1 rounded-full bg-[#DDF6F0] px-2 py-0.5 text-xs text-[#0F7E62]">{submittedTasks.length}</span></p>
                      <button type="button" className="text-[#8B92A5]">...</button>
                    </div>
                    {submittedTasks.map((task) => (
                      <div key={task.id} className="rounded-xl border border-[#EAEDF5] bg-[#FCFCFE] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-full bg-[#F4F5F9] px-2 py-1 text-[10px] font-semibold text-[#65708C]">{task.category}</span>
                          <TaskBadge label={task.badge} tone={task.badgeTone} />
                        </div>
                        <p className="text-xl font-semibold leading-tight text-[#1F2433]">{task.title}</p>
                        <p className="mt-1 text-sm text-[#6E7589]">{task.description}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          {task.submissionDate && <p className="text-xs text-[#A0A8BC]">Submitted: {task.submissionDate}</p>}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmissionTaskId(task.id);
                              setShowSubmissionModal(true);
                            }}
                            className="text-sm font-semibold text-[#17856C]"
                          >
                            View Submission
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[#E6E9F2] bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-[#2A3142]">Reviewed <span className="ml-1 rounded-full bg-[#EEF0F5] px-2 py-0.5 text-xs text-[#5A6276]">{reviewedTasks.length}</span></p>
                      <button type="button" className="text-[#8B92A5]">...</button>
                    </div>
                    {reviewedTasks.map((task) => (
                      <div key={task.id} className="rounded-xl border border-[#EAEDF5] bg-[#FCFCFE] p-2.5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-full bg-[#E8FAF4] px-2 py-1 text-[10px] font-semibold text-[#0F876B]">{task.category}</span>
                          <TaskBadge label={task.badge} tone={task.badgeTone} />
                        </div>
                        <p className="text-xl font-semibold leading-tight text-[#1F2433]">{task.title}</p>
                        <p className="mt-1 text-sm text-[#6E7589]">{task.description}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          {task.submissionDate && <p className="text-xs text-[#A0A8BC]">Submitted: {task.submissionDate}</p>}
                          <button
                            type="button"
                            onClick={() => setShowFeedbackModal(true)}
                            className="h-10 rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white"
                          >
                            View Feedback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === 'roadmap' && (
          <ClassroomRoadmapSection
            isMentor={isMentor}
            mentorRoadmapProgram={mentorRoadmapProgram}
            mentorRoadmapPhases={mentorRoadmapPhases}
            expandedMentorRoadmapPhaseIds={expandedMentorRoadmapPhaseIds}
            expandedMentorRoadmapModuleIds={expandedMentorRoadmapModuleIds}
            toggleMentorRoadmapPhase={toggleMentorRoadmapPhase}
            toggleMentorRoadmapModule={toggleMentorRoadmapModule}
            collapseAllMentorRoadmapSections={collapseAllMentorRoadmapSections}
            openAddMaterialsModal={openAddMaterialsModal}
            openEditRoadmapItemModal={openEditRoadmapItemModal}
            openEditAssignmentTaskModal={openEditAssignmentTaskModal}
            deleteMentorRoadmapItem={deleteMentorRoadmapItem}
            openNewTaskModal={openNewTaskModal}
            getRoadmapTaskPhase={getRoadmapTaskPhase}
            isNewModuleComposerOpen={isNewModuleComposerOpen}
            toggleNewModuleComposer={toggleNewModuleComposer}
            newModuleComposerByPhase={newModuleComposerByPhase}
            updateNewModuleComposerField={updateNewModuleComposerField}
            updateNewModuleComposerItem={updateNewModuleComposerItem}
            removeNewModuleComposerItem={removeNewModuleComposerItem}
            openComposerAddMaterialsModal={openComposerAddMaterialsModal}
            checkedMaterialIds={checkedMaterialIds}
            checkedTaskIds={checkedTaskIds}
            toggleMaterialCheck={toggleMaterialCheck}
            toggleTaskCheck={toggleTaskCheck}
            roadmapPhases={roadmapPhases}
            phaseThemeClasses={phaseThemeClasses}
            getTaskProgressPercent={getTaskProgressPercent}
            expandedPhaseIds={expandedPhaseIds}
            expandedModuleIds={expandedModuleIds}
            togglePhase={togglePhase}
            toggleModule={toggleModule}
          />
        )}

        {activeTab === 'students' && isMentor && (
          <ClassroomStudentsSection
            mentorStudents={mentorStudents}
            selectedStudentIds={selectedStudentIds}
            isAllStudentsSelected={isAllStudentsSelected}
            onToggleSelectAllStudents={toggleSelectAllStudents}
            onToggleStudentSelection={toggleStudentSelection}
            onDeleteSelectedStudents={deleteSelectedStudents}
            onOpenMentorSubmissionsForStudent={openMentorSubmissionsForStudent}
            onRequestDeleteStudent={requestDeleteStudent}
          />
        )}
      </div>

      {showMentorSubmissionsModal && selectedMentorTask && (
        <div className="fixed inset-0 z-[76] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-[#E6E9F2] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-[#6E7589]">Submissions</p>
                <h3 className="text-[40px] font-bold leading-tight text-[#1F2432]">{selectedMentorTask.title}</h3>
              </div>

              <button type="button" onClick={closeMentorSubmissionsModal} className="grid h-9 w-9 place-items-center rounded-full bg-[#F0F2F6] text-[#697188]">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-[#E6E9F2] bg-[#FBFCFF] p-2">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'reviewed' as const, label: 'Reviewed' },
                { id: 'needs-review' as const, label: 'Needs Review' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setMentorSubmissionsFilter(filter.id)}
                  className={`h-9 rounded-xl px-4 text-sm font-semibold transition ${
                    mentorSubmissionsFilter === filter.id
                      ? 'bg-[#6E56CF] text-white'
                      : 'bg-white text-[#5D6478] hover:bg-[#F2F4FA]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8A91A5]">
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Submitted At</th>
                    {showGradeColumn && <th className="px-3 py-2">Grade</th>}
                    {showReviewActionColumn && <th className="px-3 py-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredMentorTaskSubmissions.map((submission) => (
                    <tr key={submission.id} className="rounded-xl bg-[#FCFCFE] text-base text-[#2B3243]">
                      <td className="px-3 py-3 font-semibold text-[#1F2432]">{submission.studentName}</td>
                      <td className="px-3 py-3 text-[#5D6579]">{submission.submittedAt}</td>
                      {showGradeColumn && (
                        <td className="px-3 py-3 text-base font-bold text-[#0E7A5F]">
                          {submission.reviewStatus === 'reviewed' ? `${submission.grade}%` : '—'}
                        </td>
                      )}
                      {showReviewActionColumn && (
                        <td className="px-3 py-3 text-right">
                          {submission.reviewStatus === 'needs-review' && (
                            <button
                              type="button"
                              onClick={() => openReviewStudentFromSubmissions(submission.studentId)}
                              className="inline-flex h-10 items-center rounded-lg bg-[#6E56CF] px-4 text-sm font-semibold text-white transition hover:bg-[#5F49C8]"
                            >
                              Review Task
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMentorTaskSubmissions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#E3E7F0] bg-white px-4 py-8 text-center text-sm text-[#8D95A8]">
                  No submissions found for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddMaterialsModal && (
        <div className="fixed inset-0 z-[78] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-[860px] overflow-hidden rounded-3xl border border-[#E7EAF2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[#ECEFF5] px-6 py-5">
              <div className="inline-flex items-center gap-2 text-[28px] font-bold leading-none text-[#1F2432]">
                <Link2 size={22} className="text-[#5B45BE]" />
                <span>{addMaterialsModalTitle}</span>
              </div>

              <button
                type="button"
                onClick={closeAddMaterialsModal}
                className="grid h-9 w-9 place-items-center rounded-full text-[#5F667A] transition hover:bg-[#F3F5FA]"
                aria-label="Close add materials modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
              {newMaterialDrafts.map((draft, index) => (
                <div key={draft.id} className="rounded-2xl border border-[#E3E6F0] bg-[#FBFCFF] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleMaterialDraft(draft.id)}
                      className="inline-flex items-center gap-2 text-left"
                      aria-label={draft.isOpen ? `Collapse material ${index + 1}` : `Expand material ${index + 1}`}
                    >
                      {draft.isOpen ? (
                        <ChevronUp size={18} className="text-[#6D7487]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#6D7487]" />
                      )}
                      <span className="text-base font-semibold text-[#2B3243]">{addMaterialsDraftLabel} {index + 1}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteMaterialDraft(draft.id)}
                      disabled={newMaterialDrafts.length === 1}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition ${
                        newMaterialDrafts.length === 1
                          ? 'cursor-not-allowed text-[#B5BDCD]'
                          : 'text-[#B33A3A] hover:bg-[#FFE9E9]'
                      }`}
                      aria-label="Delete material block"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {draft.isOpen && (
                    <>
                      <div className="grid gap-4 md:grid-cols-[170px_1fr]">
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#646E84]">Type</p>
                          <div className="relative">
                            <select
                              value={draft.type}
                              onChange={(event) => updateMaterialDraft(draft.id, 'type', event.target.value)}
                              className="h-11 w-full appearance-none rounded-xl border border-transparent bg-[#EEF0F4] px-3 pr-9 text-[15px] font-medium text-[#2B3243] outline-none"
                            >
                              <option value="article">Article</option>
                              <option value="video">Video</option>
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6D7487]" />
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#646E84]">Title</p>
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(event) => updateMaterialDraft(draft.id, 'title', event.target.value)}
                            placeholder="e.g. Design Thinking Handbook"
                            className="h-11 w-full rounded-xl border border-transparent bg-[#EEF0F4] px-3 text-[15px] text-[#2B3243] outline-none placeholder:text-[#98A0B2]"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#646E84]">Link</p>
                        <input
                          type="url"
                          value={draft.link}
                          onChange={(event) => updateMaterialDraft(draft.id, 'link', event.target.value)}
                          placeholder="https://..."
                          className="h-11 w-full rounded-xl border border-transparent bg-[#EEF0F4] px-3 text-[15px] text-[#2B3243] outline-none placeholder:text-[#98A0B2]"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {!isEditingRoadmapItem && (
                <button
                  type="button"
                  onClick={addAnotherMaterialDraft}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#CFC8EE] bg-white text-base font-semibold text-[#5B45BE] transition hover:bg-[#F9F7FF]"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-[#5B45BE]">
                    <Plus size={12} />
                  </span>
                  Add Another
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 bg-[#F7F8FC] px-6 py-4">
              <button
                type="button"
                onClick={closeAddMaterialsModal}
                className="inline-flex h-11 items-center rounded-xl px-5 text-base font-semibold text-[#3F4659]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAllNewMaterials}
                disabled={!canSaveNewMaterials}
                className={`inline-flex h-11 items-center rounded-2xl px-6 text-base font-semibold text-white transition ${
                  canSaveNewMaterials
                    ? 'bg-[#5F49C8] shadow-[0_10px_24px_rgba(95,73,200,0.28)] hover:bg-[#533EB8]'
                    : 'cursor-not-allowed bg-[#BDB4E6]'
                }`}
              >
                {addMaterialsPrimaryButtonLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewTaskModal && (
        <div className="fixed inset-0 z-[77] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-[30px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between">
              <h3 className="text-[38px] font-bold leading-none text-[#1F2432]">
                {editingAssignmentContext ? 'Edit Assignment' : 'New Task'}
              </h3>
              <button type="button" onClick={closeNewTaskModal} className="text-[#556074]">
                <X size={24} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F5872]">Title</p>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E6E9F2] bg-[#F4F5F7] px-4 text-base text-[#273043] outline-none placeholder:text-[#A0A7B8]"
                  placeholder="e.g. Heuristic Review"
                />
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F5872]">Description</p>
                <textarea
                  value={newTaskDescription}
                  onChange={(event) => setNewTaskDescription(event.target.value)}
                  className="min-h-[96px] w-full rounded-xl border border-[#E6E9F2] bg-[#F4F5F7] px-4 py-3 text-base text-[#273043] outline-none placeholder:text-[#A0A7B8]"
                  placeholder="Provide assignment details..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F5872]">Phase</p>
                  <div className="relative">
                    <select
                      value={newTaskPhase}
                      onChange={(event) => setNewTaskPhase(event.target.value)}
                      className="h-12 w-full appearance-none rounded-xl border border-[#E6E9F2] bg-[#F4F5F7] px-4 pr-10 text-base font-medium text-[#273043] outline-none"
                    >
                      <option value="Foundations">Foundations</option>
                      <option value="Advanced UX">Advanced UX</option>
                      <option value="Visual Systems">Visual Systems</option>
                    </select>
                    <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7689]" />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F5872]">Deadline</p>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(event) => setNewTaskDeadline(event.target.value)}
                    className="h-12 w-full rounded-xl border border-[#E6E9F2] bg-[#F4F5F7] px-4 text-base text-[#273043] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F5872]">Task Resources</p>
                  <button type="button" onClick={addNewTaskResource} className="text-[#4F5872]">
                    <Plus size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {newTaskResources.map((resource, index) => (
                    <div key={resource.id} className="rounded-2xl border border-[#E6E9F2] bg-[#FBFCFF] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleNewTaskResource(resource.id)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2A3142]"
                        >
                          <ChevronDown size={16} className={resource.isOpen ? 'rotate-180 transition' : 'transition'} />
                          Resource {index + 1}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeNewTaskResource(resource.id)}
                          disabled={newTaskResources.length === 1}
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            newTaskResources.length === 1
                              ? 'cursor-not-allowed text-[#AAB1C2]'
                              : 'text-[#B33A3A] hover:text-[#9F2727]'
                          }`}
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>

                      {resource.isOpen && (
                        <div className="mt-3 space-y-4">
                          <div>
                            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F5872]">Title</p>
                            <input
                              type="text"
                              value={resource.title}
                              onChange={(event) => updateNewTaskResource(resource.id, 'title', event.target.value)}
                              className="h-12 w-full rounded-xl border border-[#E6E9F2] bg-[#F4F5F7] px-4 text-base text-[#273043] outline-none placeholder:text-[#A0A7B8]"
                              placeholder="e.g. Design Thinking Handbook"
                            />
                          </div>

                          <div>
                            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F5872]">Link</p>
                            <input
                              type="url"
                              value={resource.url}
                              onChange={(event) => updateNewTaskResource(resource.id, 'url', event.target.value)}
                              className="h-12 w-full rounded-xl border border-[#E6E9F2] bg-[#F4F5F7] px-4 text-base text-[#273043] outline-none placeholder:text-[#A0A7B8]"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#E6E9F2] pt-5">
              <button
                type="button"
                onClick={closeNewTaskModal}
                className="inline-flex h-11 items-center rounded-xl px-5 text-base font-semibold text-[#4F5872]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishNewTask}
                className="inline-flex h-11 items-center rounded-xl bg-[#6E56CF] px-6 text-base font-semibold text-white shadow-[0_8px_18px_rgba(110,86,207,0.28)]"
              >
                {editingAssignmentContext ? 'Save Changes' : 'Publish Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#1F2432]">Delete student?</h3>
            <p className="mt-2 text-sm text-[#697188]">
              Are you sure you want to delete {pendingDeleteStudent.name}? This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteStudentModal}
                className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="h-10 rounded-xl bg-[#C93A3A] px-4 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewTaskModal && selectedReviewStudent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-6xl rounded-[30px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between border-b border-[#ECEFF6] px-8 py-6">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedReviewStudent.name)}`}
                    alt={selectedReviewStudent.name}
                    className="h-12 w-12 rounded-full border border-[#E2E6F0]"
                  />
                  <div>
                    <p className="text-3xl font-bold leading-none text-[#1F2432]">{selectedReviewStudent.name}</p>
                    <p className="mt-1 text-sm text-[#6F7689]">Submitted Oct 24, 2023 at 2:45 PM</p>
                  </div>
                </div>
              </div>

              <button type="button" onClick={closeReviewTaskModal} className="grid h-9 w-9 place-items-center rounded-full bg-[#F0F2F6] text-[#697188]">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-6 px-8 py-6 lg:grid-cols-[1.35fr_0.95fr]">
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-xl font-bold text-[#1F2432]">
                      <Paperclip size={20} className="text-[#5B45BE]" />
                      Student Submission
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href="https://example.com/typography-final.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-[#E7EAF2] bg-white p-4 transition hover:border-[#D4DAE8] hover:bg-[#FAFBFF]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFEAE7] text-[#B84031]">
                          <FileText size={18} />
                        </span>
                        <div>
                          <p className="font-semibold text-[#2A3142]">Typography_Final.pdf</p>
                          <p className="text-sm text-[#6E7589]">2.4 MB</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href="https://example.com/design-process.docx"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-[#E7EAF2] bg-white p-4 transition hover:border-[#D4DAE8] hover:bg-[#FAFBFF]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8F6F3] text-[#147D70]">
                          <FileText size={18} />
                        </span>
                        <div>
                          <p className="font-semibold text-[#2A3142]">Design_Process.docx</p>
                          <p className="text-sm text-[#6E7589]">1.1 MB</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E7EAF2] bg-[#FCFCFE] p-5">
                  <div className="mb-3">
                    <div>
                      <p className="text-xl font-bold leading-none text-[#1F2432]">Detailed Feedback</p>
                      <p className="mt-1 text-sm text-[#6F7689]">Coach the student on their technique and execution.</p>
                    </div>
                  </div>

                  <textarea
                    value={reviewFeedback}
                    onChange={(event) => setReviewFeedback(event.target.value)}
                    className="min-h-[260px] w-full rounded-2xl border border-[#E1E5EF] bg-white p-4 text-sm text-[#2C3345] outline-none"
                    placeholder="Enter your detailed professional feedback..."
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-[#E7EAF2] bg-white p-5">
                <h3 className="text-3xl font-bold leading-none text-[#1F2432]">Final Assessment</h3>

                <div className="mt-5 flex gap-4">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[#EDE7FF] text-4xl font-bold text-[#5D49BF]">{reviewGrade || '--'}</div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6E7589]">Assign Grade</p>
                    <select
                      value={reviewGrade}
                      onChange={(event) => setReviewGrade(event.target.value)}
                      className="mt-2 h-12 w-full rounded-xl border border-[#E1E5EF] bg-[#F6F7FB] px-3 text-base font-semibold text-[#2A3142] outline-none"
                    >
                      <option value="" disabled>
                        Select grade
                      </option>
                      {Array.from({ length: 11 }, (_, index) => {
                        const grade = index * 10;
                        return (
                          <option key={grade} value={String(grade)}>
                            {grade}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendFeedback}
                  className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#6451BF] px-4 text-base font-semibold text-white"
                >
                  Send Feedback
                </button>
                <button
                  type="button"
                  onClick={handleRequestSubmission}
                  className="mt-3 inline-flex h-14 w-full items-center justify-center rounded-2xl border-2 border-[#7A67D4] px-4 text-base font-semibold text-[#6451BF]"
                >
                  Request Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPostDiscussionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold leading-tight text-[#1F2432]">Create Discussion</h2>
              <button type="button" onClick={closePostDiscussionModal}>
                <X size={18} className="text-[#6F7689]" />
              </button>
            </div>

            <div className="rounded-2xl border border-[#E1E4ED] bg-white">
              <textarea
                value={discussionText}
                onChange={(e) => setDiscussionText(e.target.value)}
                className="min-h-40 w-full resize-none rounded-t-2xl px-4 py-3 text-sm text-[#2C3345] outline-none"
                placeholder="Write your post here..."
              />

              <div className="border-t border-[#E8EBF3] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE1EE] bg-[#F8FAFF] px-3 py-2 text-sm text-[#4F5872] hover:bg-[#F2F5FF]">
                    <Image size={16} className="text-[#5E4BC5]" />
                    Add Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setSelectedImageFile(file);
                        setSelectedImageName(file?.name ?? '');
                      }}
                    />
                  </label>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DCE1EE] bg-[#F8FAFF] px-3 py-2 text-sm text-[#4F5872] hover:bg-[#F2F5FF]">
                    <Paperclip size={16} className="text-[#5E4BC5]" />
                    Upload Document
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setSelectedDocumentFile(file);
                        setSelectedDocumentName(file?.name ?? '');
                      }}
                    />
                  </label>
                </div>

                {(selectedImageName || selectedDocumentName) && (
                  <div className="mt-3 space-y-1 text-xs text-[#5E6881]">
                    {selectedImageName && <p>Image: {selectedImageName}</p>}
                    {selectedDocumentName && <p>Document: {selectedDocumentName}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closePostDiscussionModal}
                className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePostDiscussion}
                disabled={!discussionText.trim()}
                className={`h-10 rounded-xl px-4 text-sm font-semibold text-white ${
                  discussionText.trim() ? 'bg-[#6E56CF]' : 'cursor-not-allowed bg-[#BDB4E6]'
                }`}
              >
                Add Post
              </button>
            </div>
          </div>
        </div>
      )}

      {showTaskDetailsModal && selectedTaskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-6xl rounded-[34px] bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[44px] font-bold leading-none text-[#1F2432]">{selectedTaskDetails.title}</h2>
                <div className="mt-4 flex items-center gap-3">
                  <span className="rounded-full bg-[#EDE9FF] px-3 py-1 text-sm font-semibold text-[#4F3CB9]">{selectedTaskDetails.category}</span>
                  <span className="rounded-full bg-[#FFE7E7] px-3 py-1 text-sm font-semibold text-[#B63D3D]">{selectedTaskDetails.badge}</span>
                </div>
              </div>

              <button type="button" onClick={closeTaskDetailsModal} className="text-[#5B6378]">
                <X size={28} />
              </button>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.45fr_1fr]">
              <div className="space-y-8">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6F7686]">Task Summary</p>
                  <p className="mt-4 text-[20px] leading-[1.5] text-[#394155]">{selectedTaskDetails.summary || selectedTaskDetails.description}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8ECF4] p-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6F7686]">Attached Resources</p>

                <div className="mt-5 space-y-4">
                  {(selectedTaskDetails.attachedResources ?? []).map((resource) => {
                    const iconClasses = getAttachedResourceIconClasses(resource.type);

                    return (
                      <div key={resource.id} className="flex items-center gap-3 rounded-xl border border-[#EBEEF5] bg-white p-3">
                        <span className={`grid h-12 w-12 place-items-center rounded-xl ${iconClasses.wrapper}`}>
                          {resource.type === 'pdf' && <FileText size={20} className={iconClasses.icon} />}
                          {resource.type === 'doc' && <Paperclip size={20} className={iconClasses.icon} />}
                          {resource.type === 'figma' && <Image size={20} className={iconClasses.icon} />}
                          {resource.type === 'notion' && <Link2 size={20} className={iconClasses.icon} />}
                          {resource.type === 'link' && <ExternalLink size={20} className={iconClasses.icon} />}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-semibold text-[#30384A]">{resource.title}</p>
                          <p className="text-sm text-[#6E7589]">{resource.meta}</p>
                        </div>

                        <a href={resource.link} target="_blank" rel="noreferrer" className="text-[#758099] hover:text-[#4D5670]">
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeTaskDetailsModal();
                    openSubmitModalForTask(selectedTaskDetails.id);
                  }}
                  className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#5F49C8] px-6 text-lg font-semibold text-white shadow-[0_10px_24px_rgba(95,73,200,0.25)]"
                >
                  Submit Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-[22px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between px-8 pb-2 pt-8">
              <h2 className="text-[32px] font-bold leading-tight text-[#171A23]">Submit Your Assignment</h2>
              <button type="button" onClick={closeSubmitModal} className="mt-1 text-[#6D7483] transition hover:text-[#171A23]">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 px-8 pb-8 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-[#30343F]">Project link</p>
                <button type="button" onClick={addSubmissionLink} className="text-[#4F5664] transition hover:text-[#171A23]" aria-label="Add another link">
                  <Plus size={26} strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-4">
                {submissionLinks.map((link, index) => (
                  <div key={link.id} className="rounded-2xl border border-[#E8EBF2] bg-[#FAFBFD] p-4">
                    <button
                      type="button"
                      onClick={() => toggleSubmissionLink(link.id)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-[#394155]">{link.title.trim() || `Link ${index + 1}`}</span>
                      {link.isOpen ? (
                        <ChevronUp size={18} className="text-[#6F7686]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#6F7686]" />
                      )}
                    </button>

                    {link.isOpen && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#5F6778]">Title</label>
                          <input
                            value={link.title}
                            onChange={(event) => updateSubmissionLink(link.id, 'title', event.target.value)}
                            className="h-[48px] w-full rounded-2xl border border-transparent bg-[#F1F3F5] px-4 text-[15px] text-[#263042] outline-none placeholder:text-[#8B93A4]"
                            placeholder="e.g. Design Thinking Handbook"
                          />
                        </div>

                        <div className="relative">
                          <input
                            value={link.url}
                            onChange={(event) => updateSubmissionLink(link.id, 'url', event.target.value)}
                            className="h-[48px] w-full rounded-2xl border border-transparent bg-[#F1F3F5] px-4 pl-12 text-[15px] text-[#263042] outline-none placeholder:text-[#8B93A4]"
                            placeholder="https://www.figma.com/file/..."
                          />
                          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7686]">
                            <Link2 size={20} strokeWidth={2.2} />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeSubmissionLink(link.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A4251]"
                          >
                            <Trash2 size={14} />
                            Remove link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#5F6778]">Notes for your mentor</label>
                  <textarea
                    value={submissionNotes}
                    onChange={(event) => setSubmissionNotes(event.target.value)}
                    className="min-h-[144px] w-full rounded-2xl border border-transparent bg-[#F1F3F5] px-4 py-4 text-[15px] text-[#263042] outline-none placeholder:text-[#8B93A4]"
                    placeholder="Explain your design decisions, specific areas you'd like feedback on, or any challenges you faced..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-[#EEF0F4] pt-6">
                <button type="button" onClick={closeSubmitModal} className="text-[15px] font-semibold text-[#4E5766]">
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeSubmitModal}
                    className="h-14 rounded-2xl border border-[#B8BEC9] px-6 text-[15px] font-semibold text-[#2E3440] transition hover:bg-[#F7F8FA]"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmission}
                    className="inline-flex h-14 items-center gap-2 rounded-2xl bg-[#6750CF] px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(103,80,207,0.28)] transition hover:bg-[#5E48C0]"
                  >
                    Confirm Submission
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubmitToast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-[#D5F0E7] bg-white px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold text-[#0D7A63]">Task submitted successfully. Please wait for feedback.</p>
        </div>
      )}

      {showUpdateToast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-[#D5F0E7] bg-white px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold text-[#0D7A63]">Updates saved successfully.</p>
        </div>
      )}

      {showSendFeedbackToast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-[#D5F0E7] bg-white px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold text-[#0D7A63]">Feedback sent successfully.</p>
        </div>
      )}

      {showRequestSubmissionToast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-[#D5F0E7] bg-white px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.15)]">
          <p className="text-sm font-semibold text-[#0D7A63]">Submission request sent successfully.</p>
        </div>
      )}

      {showDeleteToast && lastDeletedStudent && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-[#F3D7D7] bg-white px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.15)]">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-[#9B2C2C]">Student deleted successfully.</p>
            <button
              type="button"
              onClick={undoDeleteStudent}
              className="rounded-md bg-[#FFE9E9] px-2.5 py-1 text-xs font-semibold text-[#B33A3A]"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-[#EEE8FF] px-3 py-1 text-xs font-semibold text-[#5D48BF]">{selectedSubmissionTask?.badge ?? 'Under Review'}</span>
              <button type="button" onClick={closeSubmissionModal}>
                <X size={18} className="text-[#6F7689]" />
              </button>
            </div>

            {selectedSubmissionTask ? (
              <>
                <h2 className="text-3xl font-bold leading-tight text-[#1F2432]">{selectedSubmissionTask.title}</h2>

                <div className="mt-4 space-y-3 rounded-xl bg-[#F6F7FB] p-4">
                  {selectedSubmissionTask.submissionLinks?.length ? (
                    selectedSubmissionTask.submissionLinks.map((link, index) => (
                      <div key={link.id} className="rounded-xl border border-[#E2E7F1] bg-white p-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8EAFE]">
                            <FileText size={18} className="text-[#5B62CB]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#252C3B]">{link.title || `Link ${index + 1}`}</p>
                            <p className="truncate text-sm text-[#6E7589]">{link.url || 'No URL provided'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#6E7589]">No links were submitted yet.</p>
                  )}

                  <div className="flex justify-between text-sm text-[#5F6880]">
                    <span>Submitted on</span>
                    <span>{selectedSubmissionTask.submissionDate ?? 'Not available'}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#EEE8FF] p-3 text-sm text-[#4D4A6E]">
                  {selectedSubmissionTask.mentorNotes?.trim()
                    ? selectedSubmissionTask.mentorNotes
                    : 'No notes were added for the mentor yet.'}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={openUpdateSubmissionModal}
                    className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]"
                  >
                    Update Submissions
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-[#6E7589]">Submission details are unavailable.</p>
            )}
          </div>
        </div>
      )}

      {showUpdateSubmissionModal && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#1F2432]">Update Submission</h3>
              <button type="button" onClick={() => setShowUpdateSubmissionModal(false)}>
                <X size={18} className="text-[#6F7689]" />
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-semibold text-[#30343F]">Submitted links</p>
              <button type="button" onClick={addUpdateSubmissionLink} className="text-[#4F5664] transition hover:text-[#171A23]" aria-label="Add another link">
                <Plus size={22} strokeWidth={2.2} />
              </button>
            </div>

            <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
              {updateSubmissionLinks.map((link, index) => (
                <div key={link.id} className="rounded-xl border border-[#E2E7F1] bg-[#FAFBFD] p-3">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => toggleUpdateSubmissionLink(link.id)} className="text-sm font-semibold text-[#394155]">
                      {link.title.trim() || `Link ${index + 1}`}
                    </button>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => removeUpdateSubmissionLink(link.id)} className="text-[#A23D52]" aria-label="Remove link">
                        <Trash2 size={15} />
                      </button>
                      <button type="button" onClick={() => toggleUpdateSubmissionLink(link.id)} className="text-[#6F7686]" aria-label="Toggle link section">
                        {link.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {link.isOpen && (
                    <div className="mt-3 space-y-3">
                      <input
                        value={link.title}
                        onChange={(event) => updateExistingSubmissionLink(link.id, 'title', event.target.value)}
                        className="h-11 w-full rounded-xl border border-transparent bg-[#F1F3F5] px-3 text-sm text-[#263042] outline-none"
                        placeholder="Title"
                      />
                      <div className="relative">
                        <input
                          value={link.url}
                          onChange={(event) => updateExistingSubmissionLink(link.id, 'url', event.target.value)}
                          className="h-11 w-full rounded-xl border border-transparent bg-[#F1F3F5] px-3 pl-10 text-sm text-[#263042] outline-none"
                          placeholder="https://"
                        />
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7686]">
                          <Link2 size={16} />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-[#5F6778]">Notes for your mentor</label>
              <textarea
                value={updateSubmissionNotes}
                onChange={(event) => setUpdateSubmissionNotes(event.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-transparent bg-[#F1F3F5] p-3 text-sm text-[#263042] outline-none"
                placeholder="Add more context for your mentor..."
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUpdateSubmissionModal(false)}
                className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUpdatedSubmission}
                className="h-10 rounded-xl bg-[#6E56CF] px-4 text-sm font-semibold text-white"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-bold leading-tight text-[#1F2432]">Typography Systems</h2>
              <button type="button" onClick={() => setShowFeedbackModal(false)}>
                <X size={18} className="text-[#6F7689]" />
              </button>
            </div>
            <p className="text-sm text-[#697188]">Submitted 3 Oct, 2023</p>
            <div className="mt-5 grid place-items-center">
              <div className="grid h-32 w-32 place-items-center rounded-full border-4 border-[#D7CBFF] text-4xl font-bold text-[#624BC5]">70</div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#6E7589]">Final Grade</p>
            </div>
            <div className="mt-4 rounded-xl bg-[#F6F7FB] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6A63A4]">Mentor Feedback</p>
              <p className="mt-2 text-sm leading-6 text-[#495164]">
                Your exploration of vertical rhythm and scale contrast shows strong understanding of hierarchy. Next iteration:
                tighten heading tracking for larger titles to improve visual impact.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setShowFeedbackModal(false)} className="h-10 rounded-xl border border-[#CBD1DE] px-4 text-sm font-semibold text-[#4F5872]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ClassroomPage;
