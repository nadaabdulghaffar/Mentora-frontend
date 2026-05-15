import { useCallback, useState } from 'react';
import authAPI from '../../services/authService';
import Layout from '../../shared/components/Layout';
import ClassroomTabsNav from '../../components/classroom/ClassroomTabsNav';
import ClassroomOverviewSection from '../../components/classroom/ClassroomOverviewSection';
import ClassroomScheduleSection from '../../components/classroom/ClassroomScheduleSection';
import ClassroomRoadmapSection from '../../components/classroom/ClassroomRoadmapSection';
import ClassroomMentorTasksSection from '../../components/classroom/ClassroomMentorTasksSection';
import ClassroomStudentsSection from '../../components/classroom/ClassroomStudentsSection';
import TaskBadge from '../../components/classroom/TaskBadge.tsx';
import type { FeedPostProps } from '../../components/Feed';
import {
  useTasksState,
  useMentorTasksState,
  useStudentsState,
  useRoadmapState,
  useClassroomModals,
} from './hooks';
import * as CONSTANTS from './constants';
import * as UTILS from './utils';
import type { ClassroomTab, ClassroomTask, MentorStudent, MentorCustomPublishedTask } from './types';
import {
  SubmitTaskModal,
  MentorSubmissionsModal,
  MentorReviewSubmissionModal,
  AddPostModal,
  PostDiscussionModal,
  ViewSubmissionModal,
  ViewFeedbackModal,
  ViewTaskDetailsModal,
  MentorNewTaskModal,
  type TaskDetails,
  type AddPostAttachment,
  type MentorSubmissionSummary,
  type MentorSubmissionReview,
  type MentorNewTaskResourceRow,
} from '../../components/classroom/Modals';

type MentorTaskPhaseView = {
  id: string;
  title: string;
  dotClass: string;
  milestonesLabel: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    statusLabel: string;
    statusTone: 'done' | 'review' | 'risk';
    submissions: string;
    avgScore: number;
    avgLabel: string;
  }>;
};

type MentorRegistryRow = {
  id: string;
  title: string;
  phase: string;
  submissions: string;
  avgScore: number;
  statusTone: 'done' | 'neutral';
  statusLabel: string;
};

const mentorSubmissionData: Record<string, MentorSubmissionReview[]> = {
  'mentor-task-1': [
    {
      id: 'mentor-sub-1',
      studentName: 'Sarah Jenkins',
      studentAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      submittedAt: 'Oct 24, 2023 at 2:45 PM',
      submittedAtLabel: 'Submitted Oct 24, 2023 at 2:45 PM',
      fileCount: 2,
      reviewStatus: 'reviewed',
      taskTitle: 'Typography Systems',
      attachments: [
        { id: 'a1', name: 'Typography_Final.pdf', type: 'pdf', sizeLabel: '2.4 MB' },
        { id: 'a2', name: 'Design_Process.docx', type: 'doc', sizeLabel: '1.1 MB' },
      ],
      grade: 70,
      feedback:
        'Your exploration of vertical rhythm and scale contrast shows a deep understanding of hierarchy. For your next iteration, tighten the tracking on larger headlines to create more visual impact.',
      summary: 'Great work overall.',
    },
    {
      id: 'mentor-sub-2',
      studentName: 'Mina Ali',
      studentAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      submittedAt: 'Oct 23, 2023 at 11:10 AM',
      submittedAtLabel: 'Submitted Oct 23, 2023 at 11:10 AM',
      fileCount: 1,
      reviewStatus: 'pending',
      taskTitle: 'Typography Systems',
      attachments: [
        { id: 'a3', name: 'Typography_Mockup.pdf', type: 'pdf', sizeLabel: '3.1 MB' },
      ],
      grade: 82,
      feedback: 'Good direction. The structure is clean, but the display hierarchy needs a stronger contrast range.',
      summary: 'Solid draft.',
    },
  ],
  'mentor-task-2': [
    {
      id: 'mentor-sub-3',
      studentName: 'Ahmed Omar',
      studentAvatar: 'https://randomuser.me/api/portraits/men/21.jpg',
      submittedAt: 'Oct 22, 2023 at 6:20 PM',
      submittedAtLabel: 'Submitted Oct 22, 2023 at 6:20 PM',
      fileCount: 1,
      reviewStatus: 'pending',
      taskTitle: 'User Journey Mapping',
      attachments: [
        { id: 'a4', name: 'Journey_Map.pdf', type: 'pdf', sizeLabel: '2.9 MB' },
      ],
      grade: 76,
      feedback: 'Your journey map captures the pain points well. Add more detail to the post-onboarding step.',
      summary: 'Good structure.',
    },
  ],
};

type MenteeTasksSectionProps = {
  taskItems: ClassroomTask[];
  onSubmitTask: (taskId: string) => void;
  onViewSubmission: (taskId: string) => void;
  onViewFeedback: (taskId: string) => void;
  onViewTaskDetails: (taskId: string) => void;
  title: string;
  subtitle: string;
};

const MenteeTasksSection = ({
  taskItems,
  onSubmitTask,
  onViewSubmission,
  onViewFeedback,
  onViewTaskDetails,
  title,
  subtitle,
}: MenteeTasksSectionProps) => {
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      description: 'Tasks you still need to submit',
      tasks: taskItems.filter((task) => task.status === 'todo'),
    },
    {
      id: 'submitted',
      title: 'Submitted',
      description: 'Tasks waiting for review',
      tasks: taskItems.filter((task) => task.status === 'submitted'),
    },
    {
      id: 'reviewed',
      title: 'Reviewed',
      description: 'Tasks that already received feedback',
      tasks: taskItems.filter((task) => task.status === 'reviewed'),
    },
  ] as const;

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-[#1F2432]">{title}</h1>
        <p className="mt-1 text-base text-[#6F7689]">{subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column.id} className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#ECEFF6] pb-3">
              <div>
                <h2 className="text-lg font-semibold text-[#1F2432]">{column.title}</h2>
                <p className="text-sm text-[#6F7689]">{column.description}</p>
              </div>
              <span className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-xs font-semibold text-[#667085]">
                {column.tasks.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {column.tasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#E3E7F0] px-4 py-6 text-center text-sm text-[#8D95A8]">
                  No tasks in this lane.
                </p>
              ) : (
                column.tasks.map((task) => (
                  <article key={task.id} className="rounded-2xl border border-[#E6E9F2] bg-[#FCFCFE] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A8094]">{task.category}</p>
                        <h3 className="mt-1 text-lg font-semibold leading-tight text-[#1F2432]">{task.title}</h3>
                      </div>
                      <TaskBadge label={task.badge} tone={task.badgeTone} />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#5E667D]">{task.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {column.id === 'todo' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onViewTaskDetails(task.id)}
                            className="rounded-xl border border-[#D5CCFF] bg-white px-4 py-2 text-sm font-semibold text-[#5B45BE]"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onSubmitTask(task.id)}
                            className="rounded-xl bg-[#6E56CF] px-4 py-2 text-sm font-semibold text-white"
                          >
                            Submit Task
                          </button>
                        </>
                      )}

                      {column.id === 'submitted' && (
                        <button
                          type="button"
                          onClick={() => onViewSubmission(task.id)}
                          className="rounded-xl border border-[#D5CCFF] bg-white px-4 py-2 text-sm font-semibold text-[#5B45BE]"
                        >
                          View Submission
                        </button>
                      )}

                      {column.id === 'reviewed' && (
                        <button
                          type="button"
                          onClick={() => onViewFeedback(task.id)}
                          className="rounded-xl border border-[#D5CCFF] bg-white px-4 py-2 text-sm font-semibold text-[#5B45BE]"
                        >
                          View Feedback
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const mentorTaskPhases: MentorTaskPhaseView[] = [
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
        statusTone: 'done',
        submissions: '42/45',
        avgScore: 91,
        avgLabel: 'Average score',
      },
      {
        id: 'mentor-task-2',
        title: 'Deliver Brand Typography Style Guide',
        description: 'Documenting all typography hierarchy and systematic scale implementation.',
        statusLabel: 'Requires review for next step',
        statusTone: 'review',
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
        statusTone: 'review',
        submissions: '12/45',
        avgScore: 27,
        avgLabel: 'Average score',
      },
      {
        id: 'mentor-task-4',
        title: 'Conduct Usability Study & Map Personas',
        description: 'Comprehensive user research findings translated into actionable persona mappings.',
        statusLabel: 'Requires review for next step',
        statusTone: 'risk',
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

const ClassroomPage = ({}: Record<string, never> = {}) => {
  const user = authAPI.getCurrentUser();
  const role = user?.role?.toLowerCase?.()?.trim?.() || '';
  const isMentor = role === 'mentor';

  const tasksState = useTasksState(CONSTANTS.initialTasks);
  const mentorTasksState = useMentorTasksState();
  const studentsState = useStudentsState(CONSTANTS.initialMentorStudents);
  const roadmapState = useRoadmapState(CONSTANTS.roadmapPhases);
  const modals = useClassroomModals();
  const [feedPosts, setFeedPosts] = useState<FeedPostProps[]>(CONSTANTS.classroomFeedPosts);
  const mentorRoadmapPhaseIds = CONSTANTS.mentorRoadmapPhasesData.map((phase) => phase.id);
  const mentorRoadmapModuleIds = CONSTANTS.mentorRoadmapPhasesData.flatMap((phase) =>
    phase.modules.map((module) => module.id)
  );

  const [activeTab, setActiveTab] = useState<ClassroomTab>('classroom');
  const [expandedMentorPhaseIds, setExpandedMentorPhaseIds] = useState<string[]>([
    'mentor-phase-1',
    'mentor-phase-2',
    'mentor-phase-3',
  ]);
  const [expandedMentorRoadmapPhaseIds, setExpandedMentorRoadmapPhaseIds] = useState<string[]>([
    mentorRoadmapPhaseIds[0] ?? '',
  ].filter(Boolean));
  const [expandedMentorRoadmapModuleIds, setExpandedMentorRoadmapModuleIds] = useState<string[]>([
    mentorRoadmapModuleIds[0] ?? '',
  ].filter(Boolean));
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedMentorSubmission, setSelectedMentorSubmission] = useState<MentorSubmissionReview | null>(null);
  const [mentorSubmissionsByTask, setMentorSubmissionsByTask] = useState<Record<string, MentorSubmissionReview[]>>(mentorSubmissionData);
  const [mentorCustomTasks, setMentorCustomTasks] = useState<MentorCustomPublishedTask[]>([]);

  const tabs = isMentor
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
      ];

  const mentorTaskPhasesView = mentorTaskPhases.map((phase) => ({
    ...phase,
    tasks: [...phase.tasks, ...(mentorTasksState.addedMentorTasksByPhase[phase.id] ?? [])],
  }));

  const mentorRegistryRows: MentorRegistryRow[] = mentorTaskPhasesView.flatMap((phase) =>
    phase.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      phase: phase.title,
      submissions: task.submissions,
      avgScore: task.avgScore,
      statusTone: task.avgScore >= 85 ? 'done' : 'neutral',
      statusLabel: task.avgScore >= 85 ? 'Done' : 'Still running',
    }))
  );

  const isAllStudentsSelected =
    studentsState.mentorStudents.length > 0 && studentsState.selectedStudentIds.length === studentsState.mentorStudents.length;

  const handleOpenMentorSubmissions = (_taskId: string, _filter?: 'all') => {
    mentorTasksState.setSelectedMentorTaskId(_taskId);
    mentorTasksState.setMentorSubmissionsFilter('all');
    modals.setShowMentorSubmissionsModal(true);
  };

  const handleToggleMentorPhase = (phaseId: string) => {
    setExpandedMentorPhaseIds((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId]
    );
  };

  const handleOpenNewMentorTaskModal = () => {
    mentorTasksState.resetNewTaskForm();
    modals.setShowNewTaskModal(true);
  };

  const handleCloseNewMentorTaskModal = () => {
    mentorTasksState.resetNewTaskForm();
    modals.setShowNewTaskModal(false);
  };

  const handlePublishNewMentorTask = () => {
    const trimmedTitle = mentorTasksState.newTaskTitle.trim();
    if (!trimmedTitle) return;

    const resources = mentorTasksState.newTaskResources
      .filter((r) => r.title.trim() || r.url.trim())
      .map((r) => ({ title: r.title.trim(), url: r.url.trim() }));

    const entry: MentorCustomPublishedTask = {
      id: `mentor-custom-task-${Date.now()}`,
      title: trimmedTitle,
      description: mentorTasksState.newTaskDescription.trim(),
      deadline: mentorTasksState.newTaskDeadline,
      resources,
      publishedAt: new Date().toISOString(),
    };

    setMentorCustomTasks((prev) => [entry, ...prev]);
    mentorTasksState.resetNewTaskForm();
    modals.setShowNewTaskModal(false);
  };

  const mentorNewTaskResourceRows: MentorNewTaskResourceRow[] = mentorTasksState.newTaskResources.map(
    ({ id, title, url }) => ({ id, title, url })
  );

  const handleMentorNewTaskResourcesChange = (rows: MentorNewTaskResourceRow[]) => {
    mentorTasksState.setNewTaskResources(rows.map((r) => ({ ...r, isOpen: true })));
  };

  const handleSubmitTask = (taskId: string) => {
    tasksState.setSelectedSubmitTaskId(taskId);
    modals.setShowSubmitModal(true);
  };

  const handleConfirmTaskSubmission = (_submissionLinks: any[], _submissionNotes: string) => {
    const selectedTask = tasksState.taskItems.find((t) => t.id === tasksState.selectedSubmitTaskId);
    if (selectedTask) {
      const submittedOn = UTILS.formatSubmissionDate();
      tasksState.setTaskItems((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                status: 'submitted',
                badge: 'Under Review',
                badgeTone: 'success' as const,
                submissionDate: submittedOn,
              }
            : task
        )
      );
      // Store submission links and notes if needed
      tasksState.setSelectedSubmitTaskId('');
      modals.setShowSubmitModal(false);
    }
  };

  const handleOverviewSubmitTask = () => {
    const firstTodoTask = tasksState.taskItems.find((task) => task.status === 'todo');
    if (firstTodoTask) {
      handleSubmitTask(firstTodoTask.id);
    }
  };

  const [addPostEditDraft, setAddPostEditDraft] = useState<{
    postId: string;
    content: string;
    attachments: AddPostAttachment[];
  } | null>(null);

  const closeAddPostModal = useCallback(() => {
    modals.setShowAddPostModal(false);
    setAddPostEditDraft(null);
  }, [modals]);

  const handleAddPost = useCallback(() => {
    setAddPostEditDraft(null);
    modals.setShowAddPostModal(true);
  }, [modals]);

  const handleCreatePost = useCallback(
    ({
      content,
      attachments,
    }: {
      content: string;
      attachments: AddPostAttachment[];
    }) => {
      const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'You';
      const avatarSeed = encodeURIComponent(fullName || 'You');

      const nextPost: FeedPostProps = {
        id: `feed-${Date.now()}`,
        authorId: user?.userId ?? 'current-user',
        authorName: fullName || 'You',
        authorAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`,
        content,
        timestamp: 'Just now',
        attachments: attachments.map((attachment) => ({
          id: attachment.id,
          type: attachment.type,
          url: attachment.url,
          name: attachment.name,
        })),
        likes: 0,
        comments: [],
        variant: 'classroom',
        canEdit: true,
        canDelete: true,
      };

      setFeedPosts((current) => [nextPost, ...current]);
      closeAddPostModal();
    },
    [user, closeAddPostModal]
  );

  const handleRequestPostEdit = useCallback(
    (postId: string) => {
      const post = feedPosts.find((p) => p.id === postId);
      if (!post) return;
      setAddPostEditDraft({
        postId,
        content: post.content,
        attachments: (post.attachments ?? []).map((a) => ({
          id: a.id,
          name: a.name ?? 'Attachment',
          type: a.type === 'image' ? 'image' : 'file',
          url: a.url,
        })),
      });
      modals.setShowAddPostModal(true);
    },
    [feedPosts, modals]
  );

  const handleUpdatePostFromModal = useCallback(
    (postId: string, payload: { content: string; attachments: AddPostAttachment[] }) => {
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                content: payload.content,
                attachments: payload.attachments.map((a) => ({
                  id: a.id,
                  type: a.type,
                  url: a.url,
                  name: a.name,
                })),
              }
            : p
        )
      );
    },
    []
  );

  const handleDeleteFeedPost = useCallback((postId: string) => {
    setFeedPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const handleViewSubmission = (taskId: string) => {
    tasksState.setSelectedSubmissionTaskId(taskId);
    modals.setShowSubmissionModal(true);
  };

  const handleViewFeedback = (taskId: string) => {
    tasksState.setSelectedTaskDetailsId(taskId);
    modals.setShowFeedbackModal(true);
  };

  const handleViewTaskDetails = (taskId: string) => {
    tasksState.setSelectedTaskDetailsId(taskId);
    setShowTaskDetailsModal(true);
  };

  const handleOpenMentorReview = (submissionId: string) => {
    const taskId = mentorTasksState.selectedMentorTaskId ?? '';
    const submission = mentorSubmissionsByTask[taskId]?.find((entry) => entry.id === submissionId) ?? null;
    setSelectedMentorSubmission(submission);
    modals.setShowMentorSubmissionsModal(false);
    if (submission) {
      modals.setShowReviewTaskModal(true);
    }
  };

  const handleSubmitMentorReview = (_grade: number, _feedback: string, _requestRevision: boolean) => {
    const taskId = mentorTasksState.selectedMentorTaskId ?? '';
    if (selectedMentorSubmission && taskId) {
      setMentorSubmissionsByTask((current) => ({
        ...current,
        [taskId]: (current[taskId] ?? []).map((submission) =>
          submission.id === selectedMentorSubmission.id
            ? {
                ...submission,
                reviewStatus: 'reviewed',
              }
            : submission
        ),
      }));
    }

    setSelectedMentorSubmission(null);
    modals.setShowReviewTaskModal(false);
  };

  const mentorSubmissionsForActiveTask: MentorSubmissionSummary[] = (
    mentorSubmissionsByTask[mentorTasksState.selectedMentorTaskId ?? ''] ?? []
  ).map((submission) => ({
    id: submission.id,
    studentName: submission.studentName,
    studentAvatar: submission.studentAvatar,
    submittedAt: submission.submittedAt,
    fileCount: submission.fileCount,
    reviewStatus: submission.reviewStatus,
  }));

  const handlePostDiscussion = (_content: string, _attachments?: File[]) => {
    // Handle posting discussion logic here
    modals.setShowPostDiscussionModal(false);
  };

  const handleToggleMaterialCheck = (materialId: string) => {
    roadmapState.setCheckedMaterialIds((current) =>
      current.includes(materialId) ? current.filter((id) => id !== materialId) : [...current, materialId]
    );
  };

  const handleToggleTaskCheck = (taskId: string) => {
    roadmapState.setCheckedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]
    );
  };

  const handleToggleMentorRoadmapPhase = (phaseId: string) => {
    setExpandedMentorRoadmapPhaseIds((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId]
    );
  };

  const handleToggleMentorRoadmapModule = (moduleId: string) => {
    setExpandedMentorRoadmapModuleIds((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]
    );
  };

  const handleDeleteSelectedStudents = () => {
    studentsState.selectedStudentIds.forEach((studentId) => {
      studentsState.deleteStudentById(studentId);
    });
  };

  const handleRequestDeleteStudent = (student: MentorStudent) => {
    studentsState.setPendingDeleteStudent(student);
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
            isMentor={isMentor}
            feedPosts={feedPosts}
            onAddPost={handleAddPost}
            onSubmitTask={handleOverviewSubmitTask}
              onReviewNow={() => setActiveTab('tasks')}
            pendingReviewCount={tasksState.taskItems.filter((task) => task.status === 'submitted').length}
            currentUserId={user?.userId ?? 'current-user'}
            onRequestPostEdit={handleRequestPostEdit}
            onPostDelete={handleDeleteFeedPost}
          />
        )}

        {activeTab === 'schedule' && <ClassroomScheduleSection sessions={CONSTANTS.sessions} />}

        {activeTab === 'tasks' &&
          (isMentor ? (
            <ClassroomMentorTasksSection
              mentorTaskPhasesView={mentorTaskPhasesView}
              expandedMentorPhaseIds={expandedMentorPhaseIds}
              onTogglePhase={handleToggleMentorPhase}
              onOpenSubmissions={handleOpenMentorSubmissions}
              mentorRegistryRows={mentorRegistryRows}
              mentorCustomTasks={mentorCustomTasks}
              onAddNewTask={handleOpenNewMentorTaskModal}
            />
          ) : (
            <div className="space-y-8">
              <MenteeTasksSection
                title="my tasks"
                subtitle="Track progress across the current learning phase"
                taskItems={tasksState.taskItems}
                onSubmitTask={handleSubmitTask}
                onViewSubmission={handleViewSubmission}
                onViewFeedback={handleViewFeedback}
                onViewTaskDetails={handleViewTaskDetails}
              />
              <MenteeTasksSection
                title="My roadmap tasks"
                subtitle="Track progress across the current learning phase"
                taskItems={tasksState.taskItems}
                onSubmitTask={handleSubmitTask}
                onViewSubmission={handleViewSubmission}
                onViewFeedback={handleViewFeedback}
                onViewTaskDetails={handleViewTaskDetails}
              />
            </div>
          ))}

        {activeTab === 'roadmap' && (
          <ClassroomRoadmapSection
            isMentor={isMentor}
            mentorRoadmapProgram={CONSTANTS.mentorRoadmapProgram}
            mentorRoadmapPhases={CONSTANTS.mentorRoadmapPhasesData}
            expandedMentorRoadmapPhaseIds={expandedMentorRoadmapPhaseIds}
            expandedMentorRoadmapModuleIds={expandedMentorRoadmapModuleIds}
            toggleMentorRoadmapPhase={handleToggleMentorRoadmapPhase}
            toggleMentorRoadmapModule={handleToggleMentorRoadmapModule}
            collapseAllMentorRoadmapSections={roadmapState.collapseAllMentorRoadmapSections}
            openAddMaterialsModal={() => {}}
            openEditRoadmapItemModal={() => {}}
            openEditAssignmentTaskModal={() => {}}
            deleteMentorRoadmapItem={() => {}}
            openNewTaskModal={() => {}}
            getRoadmapTaskPhase={UTILS.getRoadmapTaskPhase}
            isNewModuleComposerOpen={() => false}
            toggleNewModuleComposer={() => {}}
            newModuleComposerByPhase={roadmapState.newModuleComposerByPhase}
            updateNewModuleComposerField={() => {}}
            updateNewModuleComposerItem={() => {}}
            removeNewModuleComposerItem={() => {}}
            openComposerAddMaterialsModal={() => {}}
            checkedMaterialIds={roadmapState.checkedMaterialIds}
            checkedTaskIds={roadmapState.checkedTaskIds}
            toggleMaterialCheck={handleToggleMaterialCheck}
            toggleTaskCheck={handleToggleTaskCheck}
            roadmapPhases={CONSTANTS.roadmapPhases}
            phaseThemeClasses={CONSTANTS.phaseThemeClasses}
            getTaskProgressPercent={UTILS.getTaskProgressPercent}
            expandedPhaseIds={roadmapState.expandedPhaseIds}
            expandedModuleIds={roadmapState.expandedModuleIds}
            togglePhase={roadmapState.togglePhase}
            toggleModule={roadmapState.toggleModule}
          />
        )}

        {activeTab === 'students' && isMentor && (
          <ClassroomStudentsSection
            mentorStudents={studentsState.mentorStudents}
            selectedStudentIds={studentsState.selectedStudentIds}
            isAllStudentsSelected={isAllStudentsSelected}
            onToggleSelectAllStudents={studentsState.toggleSelectAllStudents}
            onToggleStudentSelection={studentsState.toggleStudentSelection}
            onDeleteSelectedStudents={handleDeleteSelectedStudents}
            onOpenMentorSubmissionsForStudent={() => {}}
            onRequestDeleteStudent={handleRequestDeleteStudent}
          />
        )}

        {/* Modals */}
        <MentorNewTaskModal
          isOpen={modals.showNewTaskModal}
          onClose={handleCloseNewMentorTaskModal}
          title={mentorTasksState.newTaskTitle}
          onTitleChange={mentorTasksState.setNewTaskTitle}
          description={mentorTasksState.newTaskDescription}
          onDescriptionChange={mentorTasksState.setNewTaskDescription}
          deadline={mentorTasksState.newTaskDeadline}
          onDeadlineChange={mentorTasksState.setNewTaskDeadline}
          resources={mentorNewTaskResourceRows}
          onResourcesChange={handleMentorNewTaskResourcesChange}
          onPublish={handlePublishNewMentorTask}
        />

        <SubmitTaskModal
          isOpen={modals.showSubmitModal}
          onClose={() => modals.setShowSubmitModal(false)}
          onSubmit={handleConfirmTaskSubmission}
          taskTitle={
            tasksState.taskItems.find((t) => t.id === tasksState.selectedSubmitTaskId)?.title
          }
        />

        <ViewSubmissionModal
          isOpen={modals.showSubmissionModal}
          onClose={() => modals.setShowSubmissionModal(false)}
          submission={
            tasksState.selectedSubmissionTaskId
              ? {
                  id: tasksState.selectedSubmissionTaskId,
                  taskTitle: tasksState.taskItems.find(
                    (t) => t.id === tasksState.selectedSubmissionTaskId
                  )?.title,
                  studentName: user ? `${user.firstName} ${user.lastName}` : 'Student',
                  submittedDate: tasksState.taskItems.find(
                    (t) => t.id === tasksState.selectedSubmissionTaskId
                  )?.submissionDate,
                  links: [],
                  notes: '',
                  status: 'submitted',
                }
              : null
          }
        />

        <ViewFeedbackModal
          isOpen={modals.showFeedbackModal}
          onClose={() => modals.setShowFeedbackModal(false)}
          feedback={
            tasksState.selectedTaskDetailsId
              ? {
                  id: tasksState.selectedTaskDetailsId,
                  taskTitle: tasksState.taskItems.find(
                    (t) => t.id === tasksState.selectedTaskDetailsId
                  )?.title,
                  mentorName: 'Your Mentor',
                  rating: 4,
                  feedback: 'Great work! Keep improving on these areas...',
                }
              : null
          }
        />

        <MentorReviewSubmissionModal
          isOpen={modals.showReviewTaskModal}
          onClose={() => modals.setShowReviewTaskModal(false)}
          submission={selectedMentorSubmission}
          onSubmitReview={handleSubmitMentorReview}
        />

        <PostDiscussionModal
          isOpen={modals.showPostDiscussionModal}
          onClose={() => modals.setShowPostDiscussionModal(false)}
          onPost={handlePostDiscussion}
          classroomName="The Digital Atelier"
        />

        <MentorSubmissionsModal
          isOpen={modals.showMentorSubmissionsModal}
          onClose={() => modals.setShowMentorSubmissionsModal(false)}
          taskTitle={
            mentorTaskPhasesView
              .flatMap((phase) => phase.tasks)
              .find((task) => task.id === mentorTasksState.selectedMentorTaskId)?.title
          }
          submissions={mentorSubmissionsForActiveTask}
          onViewTask={handleOpenMentorReview}
        />

        <ViewTaskDetailsModal
          isOpen={showTaskDetailsModal}
          onClose={() => setShowTaskDetailsModal(false)}
          task={
            tasksState.selectedTaskDetailsId
              ? ({
                  id: tasksState.selectedTaskDetailsId,
                  title: tasksState.taskItems.find(
                    (t) => t.id === tasksState.selectedTaskDetailsId
                  )?.title,
                  category: tasksState.taskItems.find(
                    (t) => t.id === tasksState.selectedTaskDetailsId
                  )?.category,
                  dueDate: 'OCT 24',
                  description: tasksState.taskItems.find(
                    (t) => t.id === tasksState.selectedTaskDetailsId
                  )?.description,
                  resources: [
                    {
                      id: 'resource-1',
                      name: 'Task Template.pdf',
                      type: 'pdf' as const,
                      size: '2.4 MB',
                    },
                    {
                      id: 'resource-2',
                      name: 'Reference Guide',
                      type: 'link' as const,
                      url: 'https://example.com',
                    },
                  ],
                } as TaskDetails)
              : null
          }
          onSubmitTask={() => {
            if (tasksState.selectedTaskDetailsId) {
              handleSubmitTask(tasksState.selectedTaskDetailsId);
              setShowTaskDetailsModal(false);
            }
          }}
        />

        <AddPostModal
          isOpen={modals.showAddPostModal}
          onClose={closeAddPostModal}
          onPost={handleCreatePost}
          onUpdatePost={handleUpdatePostFromModal}
          editDraft={addPostEditDraft}
        />
      </div>
    </Layout>
  );
};

export default ClassroomPage;