// Task types
export type TaskStatus = 'todo' | 'submitted' | 'reviewed';

export type TaskAttachedResource = {
  id: string;
  title: string;
  link: string;
  type: 'pdf' | 'figma' | 'notion' | 'doc' | 'link';
  meta: string;
};

export type StoredSubmissionLink = {
  id: string;
  title: string;
  url: string;
};

export type ClassroomTask = {
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

// Session types
export type SessionItem = {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  live: boolean;
};

// Mentor types
export type MentorWorkflowTask = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: 'done' | 'review' | 'risk';
  submissions: string;
  avgScore: number;
  avgLabel: string;
};

export type MentorTaskPhase = {
  id: string;
  title: string;
  dotClass: string;
  milestonesLabel: string;
  tasks: MentorWorkflowTask[];
};

export type MentorSubmissionRecord = {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  grade: number;
  reviewStatus: 'reviewed' | 'needs-review';
};

export type MentorStudent = {
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

// Roadmap types
export type RoadmapMaterial = {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'template';
  duration: string;
};

export type RoadmapTask = {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'pending' | 'overdue';
};

export type RoadmapModule = {
  id: string;
  title: string;
  subtitle: string;
  materials: RoadmapMaterial[];
  tasks: RoadmapTask[];
};

export type RoadmapPhase = {
  id: string;
  title: string;
  subtitle: string;
  progressLabel: string;
  modules: RoadmapModule[];
};

export type MentorRoadmapModule = {
  id: string;
  title: string;
  description?: string;
  materials: string[];
  assignments: string[];
};

export type MentorRoadmapPhase = {
  id: string;
  title: string;
  modulesCount: number;
  tasksCount: number;
  modules: MentorRoadmapModule[];
};

export type MentorRoadmapListType = 'materials' | 'assignments';

export type NewTaskOrigin = {
  context: 'workflow' | 'composer' | 'roadmap';
  phaseId?: string;
  moduleId?: string;
  listType?: MentorRoadmapListType;
};

export type AssignmentEditContext = {
  phaseId: string;
  moduleId: string;
  assignmentIndex: number;
};

export type MentorCustomPublishedTask = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  resources: { title: string; url: string }[];
  publishedAt: string;
};

export type NewTaskResource = {
  id: string;
  title: string;
  url: string;
  isOpen: boolean;
};

export type NewMaterialDraft = {
  id: string;
  type: 'article' | 'video';
  title: string;
  link: string;
  isOpen: boolean;
};

export type NewModuleComposerDraft = {
  title: string;
  summary: string;
  materials: string[];
  tasks: string[];
};

export type SubmissionLink = {
  id: string;
  title: string;
  url: string;
  isOpen: boolean;
};

export type ClassroomTab = 'classroom' | 'schedule' | 'roadmap' | 'tasks' | 'students';
