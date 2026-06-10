import type {
  SubmissionLink,
  StoredSubmissionLink,
  NewMaterialDraft,
  MentorRoadmapListType,
  ClassroomTask,
  TaskSource,
} from './types';
import type { BackendSubmissionResponse } from '../../components/classroom/types';
import type { ClassroomTaskApiResponse } from '../../services/classroomTaskService';

export type MentorSubmissionReviewStatus =
  | 'reviewed'
  | 'pending'
  | 'revision_requested'
  | 'draft';

export const toMentorTaskRef = (
  source: TaskSource,
  rawId: string | number
): string =>
  source === 'classroom' ? `classroom-${rawId}` : String(rawId);

export const parseMentorTaskRef = (
  taskId: string
): { source: TaskSource; rawId: string } => {
  if (taskId.startsWith('classroom-')) {
    return {
      source: 'classroom',
      rawId: taskId.replace('classroom-', ''),
    };
  }

  return {
    source: 'roadmap',
    rawId: taskId,
  };
};

export const submissionMatchesTaskRef = (
  submission: BackendSubmissionResponse,
  taskId: string
): boolean => {
  const { source, rawId } = parseMentorTaskRef(taskId);
  const submissionSource: TaskSource =
    submission.taskType === 'Classroom' ? 'classroom' : 'roadmap';

  return (
    String(submission.taskId) === rawId &&
    submissionSource === source
  );
};

export const isSubmissionVisibleInMentorModal = (
  submission: BackendSubmissionResponse
): boolean => {
  if (submission.status === 'Draft') {
    return Boolean(submission.review?.isRevisionRequest);
  }

  return submission.status === 'Submitted' || submission.status === 'Reviewed';
};

export const mapMentorSubmissionReviewStatus = (
  submission: BackendSubmissionResponse
): MentorSubmissionReviewStatus => {
  if (submission.status === 'Reviewed') {
    return 'reviewed';
  }

  if (
    submission.status === 'Draft' &&
    submission.review?.isRevisionRequest
  ) {
    return 'revision_requested';
  }

  if (submission.status === 'Submitted') {
    return 'pending';
  }

  return 'draft';
};

const mapPersonalStatusToTaskStatus = (
  personalStatus?: string
): ClassroomTask['status'] => {
  const normalized = String(personalStatus ?? '').toLowerCase();

  if (normalized === 'submitted') {
    return 'submitted';
  }

  if (normalized === 'reviewed') {
    return 'reviewed';
  }

  return 'todo';
};

const mapTaskBadge = (
  personalStatus: string | undefined,
  isRevisionRequest: boolean,
  deadline?: string
): { badge: string; badgeTone: ClassroomTask['badgeTone'] } => {
  if (isRevisionRequest) {
    return { badge: 'Revision Requested', badgeTone: 'danger' };
  }

  const normalized = String(personalStatus ?? '').toLowerCase();

  if (normalized === 'submitted') {
    return { badge: 'Under Review', badgeTone: 'neutral' };
  }

  if (normalized === 'reviewed') {
    return { badge: 'Completed', badgeTone: 'success' };
  }

  if (deadline && new Date(deadline) < new Date()) {
    return { badge: 'Overdue', badgeTone: 'danger' };
  }

  return { badge: 'To Do', badgeTone: 'neutral' };
};

export const formatTaskDeadline = (
  deadline?: string | null
): string | null => {
  if (!deadline) {
    return null;
  }

  const parsed = parseSafeUtcDate(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `Due ${parsed.toLocaleDateString()}`;
};

export const parseSafeUtcDate = (isoString?: string | null): Date => {
  if (!isoString) return new Date(NaN);
  
  const isAmbiguous = !isoString.endsWith('Z') && !isoString.match(/[+-]\d{2}:\d{2}$/);
  
  return new Date(isAmbiguous ? `${isoString}Z` : isoString);
};

export const mapRoadmapPhaseTaskToClassroomTask = (
  task: any,
  phase?: { phaseId?: string | number; title?: string }
): ClassroomTask => {
  const personalStatus = task.personalStatus;
  const isRevisionRequest =
    task.submission?.review?.isRevisionRequest ?? false;
  const { badge, badgeTone } = mapTaskBadge(
    personalStatus,
    isRevisionRequest,
    task.deadLine
  );

  return {
    id: String(task.taskId),
    taskType: 'roadmap',
    title: task.taskTitle,
    description: task.taskDescription ?? '',
    category: phase?.title || task.phaseName || 'Roadmap Task',
    phaseId: phase?.phaseId ? String(phase.phaseId) : undefined,
    phaseName: phase?.title || task.phaseName,
    deadline: task.deadLine,
    resources: task.attachmentUrl
      ? [
          {
            id: `resource-${task.taskId}`,
            name: task.attachmentName || 'Task Attachment',
            type: 'link' as const,
            url: task.attachmentUrl,
          },
        ]
      : [],
    status: mapPersonalStatusToTaskStatus(personalStatus),
    badge,
    badgeTone,
    submissionId: task.submission?.submissionId,
    isRevisionRequest,
    revisionFeedback: task.submission?.review?.feedback ?? '',
    revisionGrade: task.submission?.review?.grade ?? 0,
  };
};

export const mapClassroomApiTaskToClassroomTask = (
  task: ClassroomTaskApiResponse
): ClassroomTask => {
  const submission = task.mySubmission;
  const personalStatus = submission?.status;
  const isRevisionRequest =
    submission?.review?.isRevisionRequest ?? false;
  const { badge, badgeTone } = mapTaskBadge(
    personalStatus,
    isRevisionRequest,
    task.deadline
  );

  let status: ClassroomTask['status'] = 'todo';

  if (submission) {
    const normalized = String(submission.status ?? '').toLowerCase();

    if (normalized === 'submitted') {
      status = 'submitted';
    } else if (normalized === 'reviewed') {
      status = 'reviewed';
    } else {
      status = 'todo';
    }
  }

  return {
    id: String(task.classroomTaskId),
    taskType: 'classroom',
    title: task.title,
    description: task.description ?? '',
    category: 'Classroom',
    phaseName: 'Classroom',
    deadline: task.deadline,
    resources: task.attachmentUrl
      ? [
          {
            id: `resource-${task.classroomTaskId}`,
            name: 'Task Attachment',
            type: 'link' as const,
            url: task.attachmentUrl,
          },
        ]
      : [],
    status,
    badge,
    badgeTone,
    submissionId: submission?.submissionId,
    isRevisionRequest,
    revisionFeedback: submission?.review?.feedback ?? '',
    revisionGrade: submission?.review?.grade ?? 0,
  };
};

// Submission link normalization
export const normalizeSubmissionLinks = (links: SubmissionLink[]): StoredSubmissionLink[] =>
  links
    .map((link) => ({
      id: link.id,
      title: link.title.trim(),
      url: link.url.trim(),
    }))
    .filter((link) => link.title || link.url);

// Submission link operations
export const addSubmissionLink = (
  links: SubmissionLink[],
  setLinks: (links: SubmissionLink[]) => void
) => {
  const newLinkId = `submission-link-${Date.now()}`;
  setLinks([
    ...links,
    {
      id: newLinkId,
      title: '',
      url: '',
      isOpen: true,
    },
  ]);
};

export const toggleSubmissionLink = (
  linkId: string,
  links: SubmissionLink[],
  setLinks: (links: SubmissionLink[]) => void
) => {
  setLinks(
    links.map((link) => (link.id === linkId ? { ...link, isOpen: !link.isOpen } : link))
  );
};

export const updateSubmissionLink = (
  linkId: string,
  field: 'title' | 'url',
  value: string,
  links: SubmissionLink[],
  setLinks: (links: SubmissionLink[]) => void
) => {
  setLinks(
    links.map((link) => (link.id === linkId ? { ...link, [field]: value } : link))
  );
};

export const removeSubmissionLink = (
  linkId: string,
  links: SubmissionLink[],
  setLinks: (links: SubmissionLink[]) => void
) => {
  setLinks(links.filter((link) => link.id !== linkId));
};

// Material draft operations
export const createNewMaterialDraft = (type: 'article' | 'video' = 'article'): NewMaterialDraft => ({
  id: `material-draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  title: '',
  link: '',
  isOpen: true,
});

export const parseRoadmapItemToDraft = (
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

export const formatRoadmapDraftForList = (
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

export const updateMaterialDraft = (
  draftId: string,
  field: 'type' | 'title' | 'link',
  value: string,
  drafts: NewMaterialDraft[],
  setDrafts: (drafts: NewMaterialDraft[]) => void
) => {
  setDrafts(
    drafts.map((draft) =>
      draft.id === draftId ? { ...draft, [field]: value } : draft
    )
  );
};

export const toggleMaterialDraft = (
  draftId: string,
  drafts: NewMaterialDraft[],
  setDrafts: (drafts: NewMaterialDraft[]) => void
) => {
  setDrafts(
    drafts.map((draft) =>
      draft.id === draftId ? { ...draft, isOpen: !draft.isOpen } : draft
    )
  );
};

export const deleteMaterialDraft = (
  draftId: string,
  drafts: NewMaterialDraft[],
  setDrafts: (drafts: NewMaterialDraft[]) => void
) => {
  if (drafts.length === 1) return;
  setDrafts(drafts.filter((draft) => draft.id !== draftId));
};

// Task progress calculation
export const getTaskProgressPercent = (tasksList: any[]): number => {
  if (tasksList.length === 0) return 0;
  const completedTasks = tasksList.filter((task) => task.status === 'completed').length;
  return Math.round((completedTasks / tasksList.length) * 100);
};

// Task categorization
export const filterTasksByStatus = (tasks: any[], status: 'todo' | 'submitted' | 'reviewed') => {
  return tasks.filter((task) => task.status === status);
};

// Roadmap phase helpers
export const getRoadmapTaskPhase = (phaseTitle: string): string => {
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

// Assignment key and parsing
export const getAssignmentKey = (phaseId: string, moduleId: string, assignmentIndex: number): string =>
  `${phaseId}::${moduleId}::${assignmentIndex}`;

export const parseAssignmentValue = (assignmentValue: string) => {
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

// Default module composer
export const getDefaultNewModuleComposer = () => ({
  title: '',
  summary: '',
  materials: [],
  tasks: [],
});

// Submission date formatting
export const formatSubmissionDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Get resource icon classes
export const getAttachedResourceIconClasses = (type: 'pdf' | 'figma' | 'notion' | 'doc' | 'link') => {
  const iconMap: Record<string, { wrapper: string; icon: string }> = {
    pdf: {
      wrapper: 'bg-[#FFEAE7]',
      icon: 'text-[#B84031]',
    },
    figma: {
      wrapper: 'bg-[#F0E9FF]',
      icon: 'text-[#6940C8]',
    },
    notion: {
      wrapper: 'bg-[#E8F6F3]',
      icon: 'text-[#147D70]',
    },
    doc: {
      wrapper: 'bg-[#EAF1FF]',
      icon: 'text-[#2C5CC4]',
    },
  };

  return iconMap[type] || {
    wrapper: 'bg-[#EFF2F7]',
    icon: 'text-[#586177]',
  };
};

// Delay utility for toasts
export const showToastForDuration = (
  showSetter: (show: boolean) => void,
  duration: number = 3000
) => {
  showSetter(true);
  setTimeout(() => {
    showSetter(false);
  }, duration);
};
