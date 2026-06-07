/**
 * Centralized type definitions for ClassroomRoadmap components
 * Organized by domain for better maintainability
 */

// ==================== Mentee/Student Types ====================

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

// ==================== Mentor Types ====================

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

export type MentorRoadmapProgram = {
  title: string;
  description: string;
  level: string;
  duration: string;
};

// ==================== UI & State Types ====================

export type MentorRoadmapListType = 'materials' | 'assignments';

export type NewModuleComposerDraft = {
  title: string;
  summary: string;
  materials: string[];
  tasks: string[];
};

export type PhaseThemeClasses = {
  accent: string;
  badgeBg: string;
  badgeText: string;
  barFrom: string;
  barTo: string;
  panelBorder: string;
  panelBg: string;
  moduleBg: string;
};

// ==================== Component Props Types ====================

export type ClassroomRoadmapSectionProps = {
  // View selection
  isMentor: boolean;

  // Mentor data
  mentorRoadmapProgram: MentorRoadmapProgram;
  mentorRoadmapPhases: MentorRoadmapPhase[];
  expandedMentorRoadmapPhaseIds: string[];
  expandedMentorRoadmapModuleIds: string[];

  // Mentor handlers
  toggleMentorRoadmapPhase: (phaseId: string) => void;
  toggleMentorRoadmapModule: (moduleId: string) => void;
  collapseAllMentorRoadmapSections: () => void;
  openAddMaterialsModal: (phaseId: string, moduleId: string, listType?: MentorRoadmapListType) => void;
  openEditRoadmapItemModal: (phaseId: string, moduleId: string, listType: MentorRoadmapListType, itemIndex: number) => void;
  openEditAssignmentTaskModal: (phaseId: string, moduleId: string, itemIndex: number) => void;
  deleteMentorRoadmapItem: (phaseId: string, moduleId: string, listType: 'materials' | 'assignments', itemIndex: number) => void;

  // Mentor module composer
  openNewTaskModal: (
    phase: string,
    origin?: {
      context: 'workflow' | 'composer' | 'roadmap';
      phaseId?: string;
      moduleId?: string;
      listType?: MentorRoadmapListType;
    }
  ) => void;
  getRoadmapTaskPhase: (phaseTitle: string) => string;
  isNewModuleComposerOpen: (phaseId: string) => boolean;
  toggleNewModuleComposer: (phaseId: string) => void;
  newModuleComposerByPhase: Record<string, NewModuleComposerDraft>;
  updateNewModuleComposerField: (phaseId: string, field: 'title' | 'summary', value: string) => void;
  updateNewModuleComposerItem: (phaseId: string, listType: 'materials' | 'tasks', index: number, value: string) => void;
  removeNewModuleComposerItem: (phaseId: string, listType: 'materials' | 'tasks', index: number) => void;
  openComposerAddMaterialsModal: (phaseId: string) => void;

  // Mentee data
  roadmapPhases: RoadmapPhase[];
  expandedPhaseIds: string[];
  expandedModuleIds: string[];
  checkedMaterialIds: string[];
  checkedTaskIds: string[];

  // Mentee handlers
  togglePhase: (phaseId: string) => void;
  toggleModule: (moduleId: string) => void;
  toggleMaterialCheck: (materialId: string) => void;
  toggleTaskCheck: (taskId: string) => void;

  // Utilities
  phaseThemeClasses: PhaseThemeClasses[];
  getTaskProgressPercent: (tasksList: RoadmapTask[]) => number;
};

// ==================== UI Component Props ====================

export type ProgressBarProps = {
  percentage: number;
  barFromColor: string;
  barToColor: string;
  label?: string;
};

export type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'task';
  ariaLabel?: string;
};

export type IconButtonProps = {
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'edit' | 'delete';
  ariaLabel: string;
};

// ==================== Hook Return Types ====================

export type UseToggleListReturn = {
  toggledItems: string[];
  toggleItem: (itemId: string) => void;
  isItemToggled: (itemId: string) => boolean;
};

export type UseExpandableListReturn = {
  expandedIds: string[];
  toggleItem: (itemId: string) => void;
  collapseAll: () => void;
  expandAll: (itemIds: string[]) => void;
};



export interface BackendSubmissionLink {
  id: number;
  label: string;
  url: string;
}

export interface BackendSubmissionReview {
  grade?: number;
  feedback?: string;
  reviewedAt?: string;
  isRevisionRequest?: boolean;
}

export interface BackendSubmissionResponse {
  submissionId: number;

  taskId: number;

  taskType?: "Roadmap" | "Classroom";

  taskTitle: string;

  menteeName: string;

  menteeProfileId: string;

  menteeProfilePicture?: string;

  submittedAt: string;

  createdAt: string;

  notesForMentor?: string;

  status: string;

  links: BackendSubmissionLink[];

  review?: BackendSubmissionReview;
}