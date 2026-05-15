import { useState } from 'react';
import type {
  ClassroomTask,
  MentorStudent,
  SubmissionLink,
  NewTaskResource,
  NewMaterialDraft,
  NewModuleComposerDraft,
  NewTaskOrigin,
  AssignmentEditContext,
} from './types';

// Hook for managing task state
export const useTasksState = (initialTasks: ClassroomTask[]) => {
  const [taskItems, setTaskItems] = useState<ClassroomTask[]>(initialTasks);
  const [selectedSubmitTaskId, setSelectedSubmitTaskId] = useState<string | null>(null);
  const [selectedSubmissionTaskId, setSelectedSubmissionTaskId] = useState<string | null>(null);
  const [selectedTaskDetailsId, setSelectedTaskDetailsId] = useState<string | null>(null);
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

  return {
    taskItems,
    setTaskItems,
    selectedSubmitTaskId,
    setSelectedSubmitTaskId,
    selectedSubmissionTaskId,
    setSelectedSubmissionTaskId,
    selectedTaskDetailsId,
    setSelectedTaskDetailsId,
    submissionNotes,
    setSubmissionNotes,
    submissionLinks,
    setSubmissionLinks,
    updateSubmissionLinks,
    setUpdateSubmissionLinks,
    updateSubmissionNotes,
    setUpdateSubmissionNotes,
  };
};

// Hook for managing mentor task state
export const useMentorTasksState = () => {
  const [selectedMentorTaskId, setSelectedMentorTaskId] = useState<string | null>(null);
  const [selectedReviewStudentId, setSelectedReviewStudentId] = useState<string | null>(null);
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [mentorSubmissionsFilter, setMentorSubmissionsFilter] = useState<'all' | 'reviewed' | 'needs-review'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState('Foundations');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskResources, setNewTaskResources] = useState<NewTaskResource[]>([
    {
      id: 'new-task-resource-1',
      title: '',
      url: '',
      isOpen: true,
    },
  ]);
  const [addedMentorTasksByPhase, setAddedMentorTasksByPhase] = useState<Record<string, any[]>>({});
  const [newTaskOrigin, setNewTaskOrigin] = useState<NewTaskOrigin>({ context: 'workflow' });
  const [editingAssignmentContext, setEditingAssignmentContext] = useState<AssignmentEditContext | null>(null);
  const [assignmentDetailsByKey, setAssignmentDetailsByKey] = useState<
    Record<string, { description: string; deadline: string; link: string }>
  >({});

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

  return {
    selectedMentorTaskId,
    setSelectedMentorTaskId,
    selectedReviewStudentId,
    setSelectedReviewStudentId,
    reviewGrade,
    setReviewGrade,
    reviewFeedback,
    setReviewFeedback,
    mentorSubmissionsFilter,
    setMentorSubmissionsFilter,
    newTaskTitle,
    setNewTaskTitle,
    newTaskDescription,
    setNewTaskDescription,
    newTaskPhase,
    setNewTaskPhase,
    newTaskDeadline,
    setNewTaskDeadline,
    newTaskResources,
    setNewTaskResources,
    addedMentorTasksByPhase,
    setAddedMentorTasksByPhase,
    newTaskOrigin,
    setNewTaskOrigin,
    editingAssignmentContext,
    setEditingAssignmentContext,
    assignmentDetailsByKey,
    setAssignmentDetailsByKey,
    resetNewTaskForm,
  };
};

// Hook for managing students state
export const useStudentsState = (initialStudents: MentorStudent[]) => {
  const [mentorStudents, setMentorStudents] = useState<MentorStudent[]>(initialStudents);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [pendingDeleteStudent, setPendingDeleteStudent] = useState<MentorStudent | null>(null);
  const [lastDeletedStudent, setLastDeletedStudent] = useState<{ student: MentorStudent; index: number } | null>(null);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleSelectAllStudents = () => {
    setSelectedStudentIds((prev) => (prev.length === mentorStudents.length ? [] : mentorStudents.map((s) => s.id)));
  };

  const deleteStudentById = (studentId: string) => {
    setMentorStudents((prev) => prev.filter((student) => student.id !== studentId));
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  return {
    mentorStudents,
    setMentorStudents,
    selectedStudentIds,
    setSelectedStudentIds,
    pendingDeleteStudent,
    setPendingDeleteStudent,
    lastDeletedStudent,
    setLastDeletedStudent,
    toggleStudentSelection,
    toggleSelectAllStudents,
    deleteStudentById,
  };
};

// Hook for managing roadmap state
export const useRoadmapState = (initialPhases: any[]) => {
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<string[]>(() => initialPhases.map((phase) => phase.id));
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>(() =>
    initialPhases.map((phase) => phase.modules[0]?.id).filter(Boolean)
  );
  const [mentorRoadmapPhases, setMentorRoadmapPhases] = useState(initialPhases);
  const [expandedMentorRoadmapPhaseIds, setExpandedMentorRoadmapPhaseIds] = useState<string[]>([
    initialPhases[0]?.id || '',
  ]);
  const [expandedMentorRoadmapModuleIds, setExpandedMentorRoadmapModuleIds] = useState<string[]>([
    initialPhases[0]?.modules[0]?.id || '',
  ]);
  const [newMaterialDrafts, setNewMaterialDrafts] = useState<NewMaterialDraft[]>([]);
  const [newModuleComposerByPhase, setNewModuleComposerByPhase] = useState<Record<string, NewModuleComposerDraft>>({});
  const [checkedMaterialIds, setCheckedMaterialIds] = useState<string[]>([]);
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);
  const [selectedAddMaterialsTarget, setSelectedAddMaterialsTarget] = useState<any>(null);

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

  return {
    expandedPhaseIds,
    setExpandedPhaseIds,
    expandedModuleIds,
    setExpandedModuleIds,
    mentorRoadmapPhases,
    setMentorRoadmapPhases,
    expandedMentorRoadmapPhaseIds,
    setExpandedMentorRoadmapPhaseIds,
    expandedMentorRoadmapModuleIds,
    setExpandedMentorRoadmapModuleIds,
    newMaterialDrafts,
    setNewMaterialDrafts,
    newModuleComposerByPhase,
    setNewModuleComposerByPhase,
    checkedMaterialIds,
    setCheckedMaterialIds,
    checkedTaskIds,
    setCheckedTaskIds,
    selectedAddMaterialsTarget,
    setSelectedAddMaterialsTarget,
    togglePhase,
    toggleModule,
    toggleMentorRoadmapPhase,
    toggleMentorRoadmapModule,
    collapseAllMentorRoadmapSections,
  };
};

// Hook for managing modal states
export const useClassroomModals = () => {
  const [showPostDiscussionModal, setShowPostDiscussionModal] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showUpdateSubmissionModal, setShowUpdateSubmissionModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [showReviewTaskModal, setShowReviewTaskModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showMentorSubmissionsModal, setShowMentorSubmissionsModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showAddMaterialsModal, setShowAddMaterialsModal] = useState(false);

  return {
    showPostDiscussionModal,
    setShowPostDiscussionModal,
    showAddPostModal,
    setShowAddPostModal,
    showSubmitModal,
    setShowSubmitModal,
    showSubmissionModal,
    setShowSubmissionModal,
    showUpdateSubmissionModal,
    setShowUpdateSubmissionModal,
    showTaskDetailsModal,
    setShowTaskDetailsModal,
    showReviewTaskModal,
    setShowReviewTaskModal,
    showFeedbackModal,
    setShowFeedbackModal,
    showMentorSubmissionsModal,
    setShowMentorSubmissionsModal,
    showNewTaskModal,
    setShowNewTaskModal,
    showAddMaterialsModal,
    setShowAddMaterialsModal,
  };
};

// Hook for managing toast notifications
export const useToastNotifications = () => {
  const [showSubmitToast, setShowSubmitToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showSendFeedbackToast, setShowSendFeedbackToast] = useState(false);
  const [showRequestSubmissionToast, setShowRequestSubmissionToast] = useState(false);

  return {
    showSubmitToast,
    setShowSubmitToast,
    showUpdateToast,
    setShowUpdateToast,
    showDeleteToast,
    setShowDeleteToast,
    showSendFeedbackToast,
    setShowSendFeedbackToast,
    showRequestSubmissionToast,
    setShowRequestSubmissionToast,
  };
};
