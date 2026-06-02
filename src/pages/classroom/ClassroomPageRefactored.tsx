import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import authAPI from '../../services/authService';
import { classroomService } from '../../services/classroomService';
import Layout from '../../shared/components/Layout';
import ClassroomTabsNav from '../../components/classroom/ClassroomTabsNav';
import ClassroomOverviewSection from '../../components/classroom/ClassroomOverviewSection';
import ClassroomScheduleSection from '../../components/classroom/ClassroomScheduleSection';
import ClassroomRoadmapSection from '../../components/classroom/ClassroomRoadmapSection';
import ClassroomMentorTasksSection from '../../components/classroom/ClassroomMentorTasksSection';
import ClassroomStudentsSection from '../../components/classroom/ClassroomStudentsSection';
import TaskBadge from '../../components/classroom/TaskBadge.tsx';
import type { FeedPostProps } from '../../components/Feed';
import MentorNewSessionModal from '../../components/classroom/Modals/MentorNewSessionModal';
import SessionDetailsModal from '../../components/classroom/Modals/SessionDetailsModal';
import DeleteStudentModal from '../../components/classroom/Modals/DeleteStudentModal';
import { classroomFeedService } from "../../services/classroomFeedService";
import type {
  SubmissionLink
} from "../../components/classroom/Modals/SubmitTaskModal";

import ClassroomThreadModal 
from "../../components/community/ClassroomThreadModal";

import { getProgramView  }
from "../../services/programService";
import { taskSubmissionService }
from "../../services/taskSubmissionService";
import { useRoadmapBuilderStore }
from "../../store/roadmapBuilderStore";

import { mentorTaskService }
from "../../services/mentorTaskService";
import { messagingService } from "../../services/messagingService";



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
  type FeedbackView,
} from '../../components/classroom/Modals';
import type { BackendSubmissionResponse } from '../../components/classroom/types.ts';


const mapSession = (session: any) => ({
  id: String(session.sessionId),
  title: session.title,
  dateLabel: `${session.dateDisplay} • ${session.timeDisplay}`,
  duration: "60 min",
  live: session.isJoinable,
  meetingLink: session.meetingLink,
  scheduledAt: session.scheduledAt,
});



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



type MenteeTasksSectionProps = {
  taskItems: ClassroomTask[];

  onSubmitTask: (
    taskId: string
  ) => void;

  onViewSubmission: (
    taskId: string
  ) => void;

  onViewFeedback: (
    taskId: string
  ) => void;

  onViewTaskDetails: (
    taskId: string
  ) => void;

  onViewRevisionFeedback: (
    task: ClassroomTask
  ) => void;

  onResubmitTask: (
    taskId: string
  ) => void;

  title: string;

  subtitle: string;
};

const MenteeTasksSection = ({
  taskItems,
  onSubmitTask,
  onViewSubmission,
  onViewFeedback,
  onViewTaskDetails,
  onViewRevisionFeedback,
  onResubmitTask,
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
<p
  className="
    text-xs
    font-semibold
    uppercase
    tracking-[0.12em]
    text-[#7A8094]
  "
>
  {task.deadline
    ? `Due ${new Date(
        task.deadline
      ).toLocaleDateString()}`
    : task.category}
</p>                        <h3 className="mt-1 text-lg font-semibold leading-tight text-[#1F2432]">{task.title}</h3>
                      </div>
                      <TaskBadge label={task.badge} tone={task.badgeTone} />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#5E667D]">{task.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
{column.id === "todo" && (

  task.isRevisionRequest ? (

    <>
      <button
        type="button"
        onClick={() =>
          onViewRevisionFeedback(
            task
          )
        }
        className="rounded-xl border border-[#D5CCFF] bg-white px-4 py-2 text-sm font-semibold text-[#5B45BE]"
      >
        View Feedback
      </button>

      <button
        type="button"
        onClick={() =>
          onResubmitTask(
            task.id
          )
        }
        className="rounded-xl bg-[#6E56CF] px-4 py-2 text-sm font-semibold text-white"
      >
        Resubmit
      </button>
    </>

  ) : (

    <>
      <button
        type="button"
        onClick={() =>
          onViewTaskDetails(
            task.id
          )
        }
        className="rounded-xl border border-[#D5CCFF] bg-white px-4 py-2 text-sm font-semibold text-[#5B45BE]"
      >
        View Details
      </button>

      <button
        type="button"
        onClick={() =>
          onSubmitTask(
            task.id
          )
        }
        className="rounded-xl bg-[#6E56CF] px-4 py-2 text-sm font-semibold text-white"
      >
        Submit Task
      </button>
    </>

  )

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



const ClassroomPage = ({}: Record<string, never> = {}) => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const classroomProgramId =
  Number(programId);

  const user = authAPI.getCurrentUser();
  const role = user?.role?.toLowerCase?.()?.trim?.() || '';
  const isMentor = role === 'mentor';

  const tasksState = useTasksState(CONSTANTS.initialTasks);
  const { setTaskItems } = tasksState;

  const [classroomData, setClassroomData] =
  useState<any>(null);

  const [mentorUserId, setMentorUserId] = useState<string | null>(null);

  const [roadmapId, setRoadmapId] =
  useState<number | null>(null);

  const [
  dashboardData,
  setDashboardData
] = useState<any>(null);

const [
  isDashboardLoading,
  setIsDashboardLoading
] = useState(false);

  const [haveLoadedRoadmapTasks, setHaveLoadedRoadmapTasks] = useState(false);

  const mentorTasksState = useMentorTasksState();
  const studentsState = useStudentsState(CONSTANTS.initialMentorStudents);

  const {
  setMentorStudents
} = studentsState;

  const roadmapState = useRoadmapState(CONSTANTS.roadmapPhases);
  const modals = useClassroomModals();
const [feedPosts, setFeedPosts] =
useState<FeedPostProps[]>(
  []
);






  const [isFeedLoading, setIsFeedLoading] =
  useState(false);

  const [sessions, setSessions] = useState([]);
const [sessionsLoading, setSessionsLoading] = useState(true);
const [showNewSessionModal, setShowNewSessionModal] = useState(false);

const [isSchedulingSession, setIsSchedulingSession] = useState(false);

const [sessionTitle, setSessionTitle] = useState('');
const [sessionDate, setSessionDate] = useState('');
const [sessionTime, setSessionTime] = useState('');
const [meetingLink, setMeetingLink] = useState('');

const [selectedSession, setSelectedSession] = useState<any>(null);
const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false);

const [editingSession, setEditingSession] = useState<any>(null);

const [
  mentorFullSubmissions,
  setMentorFullSubmissions,
] = useState<
  BackendSubmissionResponse[]
>([]);



const [
  resubmitLinks,
  setResubmitLinks
] = useState<
  SubmissionLink[]
>([]);

const [
  resubmitNotes,
  setResubmitNotes
] = useState('');

const [
  isDeletingStudent,
  setIsDeletingStudent
] = useState(false);

const [
  messagingStudentId,
  setMessagingStudentId
] = useState<string | null>(null);

const [
  selectedSubmission,
  setSelectedSubmission,
] = useState<any>(null);

const [
  editingSubmissionId,
  setEditingSubmissionId
] = useState<number | null>(
  null
);

const [
  isLoadingSubmission,
  setIsLoadingSubmission,
] = useState(false);



const [
  selectedFeedback,
  setSelectedFeedback
] = useState<FeedbackView | null>(
  null
);

const [
  mentorSubmissionsForActiveTask,
  setMentorSubmissionsForActiveTask,
] = useState<
  MentorSubmissionSummary[]
>([]);


const fetchComments = useCallback(
  async (postId: string) => {

    try {

      const response =
        await classroomFeedService.getComments(
          classroomProgramId,
          Number(postId)
        );

      const mappedComments =
        response.data.map(
          (comment: any) => ({

            id:
              String(comment.commentId),

            authorId:
              comment.author.userId,

            authorName:
              comment.author.fullName,

            authorAvatar:
              comment.author.profilePictureUrl ||

              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                comment.author.fullName
              )}`,

            content:
              comment.content,

            timestamp:
              new Date(
                comment.createdAt
              ).toLocaleString(),

            likes:
              comment.likesCount,

            likedByMe:
              comment.likedByMe,

            canEdit:
              comment.author.userId ===
              user?.userId,

            canDelete:
              comment.author.userId ===
              user?.userId,

            replies: [],
          })
        );

      setFeedPosts(
        prev =>
          prev.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments:
                    mappedComments,
                }
              : post
          )
      );

    } catch (error) {

      console.error(
        "Failed to fetch comments",
        error
      );

    }

  },
  [
    classroomProgramId,
    user?.userId
  ]
);

const [
  selectedFeedPost,
  setSelectedFeedPost
] = useState<FeedPostProps | null>(
  null
);

const [
  showThreadModal,
  setShowThreadModal
] = useState(false);

const fetchFeed = useCallback(
  async () => {

    try {

      setIsFeedLoading(true);

      const response =
        await classroomFeedService.getFeed(
          classroomProgramId
        );

      const mappedPosts =
        response.data.posts.map(
          (post: any) => ({
            id: String(post.postId),
            authorId: post.author.userId,
            authorName: post.author.fullName,
            authorAvatar:
              post.author.profilePictureUrl ||

              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                post.author.fullName
              )}`,
            content: post.content,
            timestamp: new Date(
              post.createdAt
            ).toLocaleString(),
            attachments: [],
            likes: post.likesCount,
            likedByMe: post.likedByMe,
            commentCount:
    post.commentsCount ?? 0,

  shareCount: 0,
            comments: [],
            variant: "classroom",
            canEdit:
              post.author.userId ===
              user?.userId,
            canDelete:
              post.author.userId ===
              user?.userId,
          })
        );

      setFeedPosts(mappedPosts);

    } catch (error) {

      console.error(
        "Failed to fetch feed",
        error
      );

    } finally {

      setIsFeedLoading(false);

    }

  },
  [
    classroomProgramId,
    user?.userId
  ]
);


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


const [
  selectedMentorSubmission,
  setSelectedMentorSubmission,
] = useState<
  MentorSubmissionReview | null
>(null);


  const [mentorCustomTasks, setMentorCustomTasks] = useState<MentorCustomPublishedTask[]>([]);

  const phases =
  useRoadmapBuilderStore(
    (s) => s.phases
  );
  const loadForView = useRoadmapBuilderStore((s) => s.loadForView);
  console.log(
  "CLASSROOM PHASES:",
  phases
);

const [mentorTaskPhasesView, setMentorTaskPhasesView] =
useState<MentorTaskPhaseView[]>([]);

const [mentorRegistryRows, setMentorRegistryRows] =
useState<MentorRegistryRow[]>([]);





  // ensure roadmap phases are loaded into the builder store even if the roadmap tab
  // component isn't mounted. This moves the responsibility to the page-level.
  useEffect(() => {
    if (!roadmapId) return;
    loadForView(roadmapId);
  }, [roadmapId, loadForView]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);

        const data = await classroomService.getSessions(classroomProgramId);
        console.log("Sessions Response:", data);
        setSessions(data.data.map(mapSession));
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setSessionsLoading(false);
      }
    };

    const fetchClassroom = async () => {
      try {
        const response = await classroomService.getClassroom(classroomProgramId);

        if (response.success) {
          setClassroomData(response.data);
          console.log(response.data);

          const programResponse = await getProgramView(classroomProgramId);
          setRoadmapId(programResponse.roadmap?.roadmapId ?? null);
          setMentorUserId(programResponse.mentorProfileId ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch classroom", error);
      }
    };

    const fetchDashboard = async () => {

  try {

    setIsDashboardLoading(
      true
    );

    const response =
      await classroomService
        .getClassroomDashboard(
          classroomProgramId
        );

    console.log(
      "DASHBOARD RESPONSE:",
      response
    );

    if (
      response.success
    ) {

      setDashboardData(
        response.data
      );
      const mappedStudents =
  response.data.students.map(
    (student: any) => ({

      id:
        student.studentId,

      name:
        student.fullName,

      email:
        student.lastCompletedItemTitle ||
        "No Activity Yet",

      statusLabel:
        student.tasksWaitingForReview > 0

          ? "Needs Feedback"

          : student.isAtRisk

          ? "Idle Student"

          : "Module Active",

      statusTone:
        student.tasksWaitingForReview > 0

          ? "feedback"

          : student.isAtRisk

          ? "idle"

          : "active",

      moduleLabel:
        student.lastCompletedItemTitle ||
        "No Activity",

      progress:
        student.overallCompletionPercent,

      completedTasks:
        student.completedTasks,

      totalTasks:
        student.totalTasks,

      lastActive:
        student.lastCompletedAt,

    })
  );

setMentorStudents(
  mappedStudents
);

    }

  } catch (error) {

    console.error(
      "Failed to fetch dashboard",
      error
    );

  } finally {

    setIsDashboardLoading(
      false
    );

  }

};

    fetchSessions();
    fetchClassroom();
    fetchFeed();
    fetchDashboard();
  }, [classroomProgramId,
     fetchFeed
  ]);

useEffect(() => {

  if (!isMentor || !classroomProgramId) {
    return;
  }

  const fetchMentorTasks = async () => {

    try {

      const response =
        await mentorTaskService.getTaskRegistry(
          classroomProgramId
        );

      const registry =
        Array.isArray(response.data)
          ? response.data
          : [];

     console.log(
  "MENTOR TASK REGISTRY RAW:",
  response
);

console.log(
  "MENTOR TASK REGISTRY DATA:",
  response.data
);

    } catch (error) {

      console.error(
        "Failed to fetch mentor task registry",
        error
      );

    }

  };

  fetchMentorTasks();

}, [isMentor, classroomProgramId]);

useEffect(() => {

  if (!isMentor || !classroomProgramId) {
    return;
  }

  const fetchMentorRegistry =
    async () => {

      try {

        const response =
          await mentorTaskService
            .getTaskRegistry(
              classroomProgramId
            );

        const registry =
          Array.isArray(response.data)
            ? response.data
            : [];

        console.log(
          "MENTOR TASK REGISTRY:",
          registry
        );

       const groupedPhases =
  registry.reduce(
    (
      acc: any,
      task: any
    ) => {

      const phaseName =
        task.phaseName ||
        "General";

      if (
        !acc[phaseName]
      ) {

        acc[
          phaseName
        ] = {

          id:
            `phase-${phaseName}`,

          title:
            phaseName,

          dotClass:
            "bg-[#6E56CF]",

          milestonesLabel:
            `${task.totalSubmissions || 0} submissions`,

          tasks: [],

        };

      }

      acc[
        phaseName
      ].tasks.push({

        id: String(
          task.taskId
        ),

        title:
          task.taskName,

        description:
          "",

        statusLabel:
          task.status ||
          "Open",

        statusTone:
          Number(
            task.averageScore || 0
          ) >= 85
            ? "done"
            : Number(
                task.averageScore || 0
              ) >= 50
            ? "review"
            : "risk",

        submissions:
          `${task.totalSubmissions || 0}/${task.totalStudents || 0}`,

        avgScore:
          Number(
            task.averageScore || 0
          ),

        avgLabel:
          "Average score",

      });

      return acc;

    },
    {}
  );

setMentorTaskPhasesView(
  Object.values(
    groupedPhases
  ) as MentorTaskPhaseView[]
);

        setMentorTaskPhasesView(
          Object.values(
            groupedPhases
          ) as MentorTaskPhaseView[]
        );

const mappedRegistry =
  registry.map(
    (task: any) => ({

      id: String(
        task.taskId
      ),

      title:
        task.taskName,

      phase:
        task.phaseName ||
        "General",

      submissions:
        `${task.totalSubmissions || 0}/${task.totalStudents || 0}`,

      avgScore:
        Number(
          task.averageScore || 0
        ),

      statusTone:
        Number(
          task.averageScore || 0
        ) >= 85
          ? "done"
          : "neutral",

      statusLabel:
        task.status ||
        "Open",

    })
  );

setMentorRegistryRows(
  mappedRegistry
);

      } catch (error) {

        console.error(
          "Failed to fetch mentor registry",
          error
        );

      }

    };

  fetchMentorRegistry();

}, [
  isMentor,
  classroomProgramId,
]);


useEffect(() => {

  // mentor should NOT call mentee roadmap task endpoint
  if (isMentor) {
    return;
  }

  if (
    !roadmapId ||
    haveLoadedRoadmapTasks ||
    !phases.length
  ) {
    return;
  }

  const validPhaseIds = phases
    .map((phase) =>
      Number(phase.phaseId)
    )
    .filter(Boolean);

  if (!validPhaseIds.length) {
    return;
  }

  let isCancelled = false;

  const fetchRoadmapTasks = async () => {

    try {

      const [
        todoResponses,
        submittedResponses,
        reviewedResponses,
      ] = await Promise.all([

        Promise.all(
          validPhaseIds.map(
            (phaseId) =>
              taskSubmissionService.getPhaseTasks(
                phaseId
              )
          )
        ),

        Promise.all(
          validPhaseIds.map(
            (phaseId) =>
              taskSubmissionService.getPhaseTasks(
                phaseId,
                "Submitted"
              )
          )
        ),

        Promise.all(
          validPhaseIds.map(
            (phaseId) =>
              taskSubmissionService.getPhaseTasks(
                phaseId,
                "Reviewed"
              )
          )
        ),

      ]);

      if (isCancelled) {
        return;
      }

      const todoTasks =
        todoResponses.flatMap((r) =>
          Array.isArray(r.data)
            ? r.data
            : []
        );

      const submittedTasks =
        submittedResponses.flatMap((r) =>
          Array.isArray(r.data)
            ? r.data
            : []
        );

      const reviewedTasks =
        reviewedResponses.flatMap((r) =>
          Array.isArray(r.data)
            ? r.data
            : []
        );

      console.log(
        "TODO TASKS:",
        todoTasks
      );

      console.log(
        "SUBMITTED TASKS:",
        submittedTasks
      );

      console.log(
        "REVIEWED TASKS:",
        reviewedTasks
      );

      const mappedTasks = [

        ...todoTasks,
        ...submittedTasks,
        ...reviewedTasks,

      ].map(
        (task: any): ClassroomTask => ({

          id: String(task.taskId),

          title: task.taskTitle,

          description:
            task.taskDescription,

          category:
            "Roadmap Task",

          deadline:
            task.deadLine,

          resources:
            task.attachmentUrl
              ? [
                  {
                    id:
                      `resource-${task.taskId}`,

                    name:
                      task.attachmentName ||
                      "Task Attachment",

                    type:
                      "link" as const,

                    url:
                      task.attachmentUrl,
                  },
                ]
              : [],

          status: (
            String(
              task.personalStatus ?? ''
            ).toLowerCase() ===
            'submitted'
              ? 'submitted'
              : String(
                  task.personalStatus ?? ''
                ).toLowerCase() ===
                'reviewed'
              ? 'reviewed'
              : 'todo'
          ) as
            | 'todo'
            | 'submitted'
            | 'reviewed',

badge:

task.submission?.review
  ?.isRevisionRequest

  ? "Revision Requested"

  : String(
      task.personalStatus ?? ''
    ).toLowerCase() ===
    "submitted"

  ? "Under Review"

  : String(
      task.personalStatus ?? ''
    ).toLowerCase() ===
    "reviewed"

  ? "Completed"

  : task.deadLine &&
    new Date(task.deadLine) < new Date()

  ? "Overdue"

  : "To Do",

badgeTone:

task.submission?.review
  ?.isRevisionRequest

  ? "danger"

  : String(
      task.personalStatus ?? ''
    ).toLowerCase() ===
    "reviewed"

  ? "success"

  : String(
      task.personalStatus ?? ''
    ).toLowerCase() ===
    "submitted"

  ? "neutral"

  : task.deadLine &&
    new Date(task.deadLine) < new Date()

  ? "danger"

  : "neutral",

        submissionDate:
  undefined,

submissionId:
  task.submission?.submissionId,

isRevisionRequest:
  task.submission?.review
    ?.isRevisionRequest ?? false,

revisionFeedback:
  task.submission?.review
    ?.feedback ?? "",

revisionGrade:
  task.submission?.review
    ?.grade ?? 0,


        })
      );

      setTaskItems(
        mappedTasks
      );

      setHaveLoadedRoadmapTasks(
        true
      );

    } catch (error) {

      console.error(
        "Failed to fetch roadmap tasks",
        error
      );

    }

  };

  fetchRoadmapTasks();

  return () => {
    isCancelled = true;
  };

}, [
  roadmapId,
  phases,
  haveLoadedRoadmapTasks,
  setTaskItems,
  isMentor,
]);

useEffect(() => {
  setHaveLoadedRoadmapTasks(false);
  setTaskItems([]);
}, [roadmapId, setTaskItems]);


const handleOpenPostDetails =
  useCallback(
    (post: FeedPostProps) => {

      console.log(
        "OPEN POST",
        post
      );

      setSelectedFeedPost(
        post
      );

      setShowThreadModal(
        true
      );

    },
    []
  );

const handleScheduleSession = async () => {
  try {
    setIsSchedulingSession(true);

    const scheduledAt = new Date(
      `${sessionDate}T${sessionTime}`
    ).toISOString();

    const payload = {
      title: sessionTitle,
      scheduledAt,
      meetingLink,
    };

    if (editingSession) {
      await classroomService.updateSession(
        Number(editingSession.id),
        payload
      );
    } else {
await classroomService.createSession(
  classroomProgramId,
  payload
);    }

    const refreshedSessions =
      await classroomService.getSessions(classroomProgramId);

    setSessions(refreshedSessions.data.map(mapSession));

    setSessionTitle('');
    setSessionDate('');
    setSessionTime('');
    setMeetingLink('');

    setEditingSession(null);

    setShowNewSessionModal(false);

  } catch (error) {
    console.error(
      editingSession
        ? 'Failed to update session:'
        : 'Failed to create session:',
      error
    );
  } finally {
    setIsSchedulingSession(false);
  }
};



const handleCancelSession = async (sessionId: string) => {
try {
await classroomService.cancelSession(Number(sessionId));


const refreshedSessions =
  await classroomService.getSessions(classroomProgramId);

setSessions(refreshedSessions.data.map(mapSession));

setShowSessionDetailsModal(false);


} catch (error) {
console.error('Failed to cancel session:', error);
}
};





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



 

  const isAllStudentsSelected =
    studentsState.mentorStudents.length > 0 && studentsState.selectedStudentIds.length === studentsState.mentorStudents.length;




const handleOpenMentorSubmissions =
  async (
    taskId: string,
    _filter?: "all"
  ) => {

    try {

      mentorTasksState.setSelectedMentorTaskId(
        taskId
      );

      mentorTasksState.setMentorSubmissionsFilter(
        "all"
      );

      const response =
        await mentorTaskService.getProgramSubmissions(
          classroomProgramId,
          Number(taskId)
        );

      console.log(
        "MENTOR SUBMISSIONS:",
        response
      );

      console.log(
  "TASK ID:",
  taskId
);

      const submissions =
        Array.isArray(response.data)
          ? response.data
          : [];

      const filteredSubmissions =
  submissions.filter(
    (submission: any) =>

      String(
        submission.taskId
      ) === taskId
  );

const visibleSubmissions =
  filteredSubmissions.filter(
    (submission: any) =>
      submission.status !== "Draft"
  );

setMentorFullSubmissions(
  visibleSubmissions
);

const mappedSubmissions:
MentorSubmissionSummary[] =

  visibleSubmissions.map(
    (
      submission:
      BackendSubmissionResponse
    ) => ({

      id: String(
        submission.submissionId
      ),

      studentName:
        submission.menteeName,

      studentAvatar:
        submission.menteeProfilePicture ||

        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          submission.menteeName
        )}`,

      submittedAt:
        submission.submittedAt,

      fileCount:
        submission.links?.length || 0,

reviewStatus:
  submission.status === "Reviewed"

    ? "reviewed"

    : submission.status === "Submitted"

    ? "pending"

    : "draft",

    })
  );

      setMentorSubmissionsForActiveTask(
        mappedSubmissions
      );

      modals.setShowMentorSubmissionsModal(
        true
      );

    } catch (error) {

      console.error(
        "Failed to load mentor submissions",
        error
      );

    }
  };

  const handleOpenMentorSubmissionsForStudent =
  async (
    studentId: string
  ) => {

    try {

      const response =
        await mentorTaskService
          .getProgramSubmissions(
            classroomProgramId
          );

      const submissions =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      const studentSubmissions =
        submissions.filter(
          (submission: any) =>

            submission
              .menteeProfileId ===
            studentId &&

            submission.status ===
              "Submitted"
        );

      setMentorFullSubmissions(
        studentSubmissions
      );

      const mappedSubmissions =
        studentSubmissions.map(
          (
            submission: any
          ) => ({

            id: String(
              submission.submissionId
            ),

            studentName:
              submission.menteeName,

            studentAvatar:
              submission.menteeProfilePicture ||

              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                submission.menteeName
              )}`,

            submittedAt:
              submission.submittedAt,

            fileCount:
              submission.links
                ?.length || 0,

            reviewStatus:
              "pending",

          })
        );

      setMentorSubmissionsForActiveTask(
        mappedSubmissions
      );

      modals.setShowMentorSubmissionsModal(
        true
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to load student submissions",
        error
      );

    }

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

const handleConfirmDeleteStudent =
  async () => {

    const student =
      studentsState
        .pendingDeleteStudent;

    if (!student) return;

    try {

      setIsDeletingStudent(
        true
      );

      await classroomService
        .deleteStudent(
          classroomProgramId,
          student.id
        );

      studentsState
        .deleteStudentById(
          student.id
        );

      studentsState
        .setPendingDeleteStudent(
          null
        );

    } catch (
      error
    ) {

      console.error(
        "Failed to delete student",
        error
      );

    } finally {

      setIsDeletingStudent(
        false
      );

    }

  };

  const handleSubmitTask = (taskId: string) => {
    tasksState.setSelectedSubmitTaskId(taskId);
    modals.setShowSubmitModal(true);
  };


 const handleDeleteStudent =
  async (
    studentId: string
  ) => {

    try {

      await classroomService
        .deleteStudent(
          classroomProgramId,
          studentId
        );

      studentsState.deleteStudentById(
        studentId
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to delete student",
        error
      );

    }

  };


const handleConfirmTaskSubmission =
  async (
    submissionLinks: any[],
    submissionNotes: string
  ) => {

    try {

      const selectedTask =
        tasksState.taskItems.find(
          (t) =>
            t.id ===
            tasksState.selectedSubmitTaskId
        );

      if (!selectedTask) {
        return;
      }

      const payload = {

        title:
          selectedTask.title,

        notesForMentor:
          submissionNotes,

        publish: true,

        links:
          submissionLinks
            .filter(
              (link) =>
                link.url?.trim()
            )
            .map((link) => ({

              url:
                link.url,

              label:
                link.title ||
                "Project Link",

            })),

      };

      if (
        editingSubmissionId
      ) {

        await taskSubmissionService
          .updateSubmission(
            editingSubmissionId,
            payload
          );

      } else {

        await taskSubmissionService
          .createSubmission(

            Number(
              selectedTask.id
            ),

            payload

          );

      }

      const submittedOn =
        UTILS.formatSubmissionDate();

      tasksState.setTaskItems(
        (prev) =>

          prev.map((task) =>

            task.id ===
            selectedTask.id

              ? {

                  ...task,

                  status:
                    "submitted",

                  badge:
                    "Under Review",

                  badgeTone:
                    "success" as const,

                  submissionDate:
                    submittedOn,

                  isRevisionRequest:
                    false,

                }

              : task

          )

      );

      setEditingSubmissionId(
        null
      );

      tasksState
        .setSelectedSubmitTaskId(
          ""
        );

      modals
        .setShowSubmitModal(
          false
        );

    } catch (error) {

      console.error(
        "Failed to submit task",
        error
      );

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
  async ({
    content,
  }: {
    content: string;
    attachments: AddPostAttachment[];
  }) => {

    try {

      await classroomFeedService.createPost(
        classroomProgramId,
        content
      );

      await fetchFeed();

      closeAddPostModal();

    } catch (error) {

      console.error(
        "Failed to create post",
        error
      );

    }

  },
  [
    classroomProgramId,
    fetchFeed,
    closeAddPostModal,
  ]
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

const handleToggleLikePost =
  useCallback(
    async (
      postId: string
    ) => {

      setSelectedFeedPost(
        (prev) => {

          if (
            !prev ||
            prev.id !== postId
          ) {
            return prev;
          }

          const nextLiked =
            !prev.likedByMe;

          return {

            ...prev,

            likedByMe:
              nextLiked,

            likes:
              nextLiked
                ? prev.likes + 1
                : Math.max(
                    0,
                    prev.likes - 1
                  ),
          };
        }
      );

      try {

        await classroomFeedService
          .toggleLikePost(
            classroomProgramId,
            Number(postId)
          );

        await fetchFeed();

      } catch (error) {

        console.error(
          "Failed to toggle like",
          error
        );

      }

    },
    [
      classroomProgramId,
      fetchFeed
    ]
  );

const handleUpdatePostFromModal = useCallback(
  async (
    postId: string,
    payload: {
      content: string;
      attachments: AddPostAttachment[];
    }
  ) => {

    try {

      await classroomFeedService.updatePost(
        classroomProgramId,
        Number(postId),
        payload.content
      );

      await fetchFeed();

      closeAddPostModal();

    } catch (error) {

      console.error(
        "Failed to update post",
        error
      );

    }

  },
  [
    classroomProgramId,
    fetchFeed,
    closeAddPostModal,
  ]
);

const handleDeleteFeedPost = useCallback(
  async (
    postId: string
  ) => {

    try {

      await classroomFeedService.deletePost(
        classroomProgramId,
        Number(postId)
      );

      await fetchFeed();

    } catch (error) {

      console.error(
        "Failed to delete post",
        error
      );

    }

  },
  [
    classroomProgramId,
    fetchFeed
  ]
);

const handleViewSubmission =
  async (taskId: string) => {

    try {

      setIsLoadingSubmission(true);

      const response =
        await taskSubmissionService
          .getMySubmission(
            Number(taskId)
          );

      const submission =
        response.data;

      const apiBase =
        (
          import.meta.env
            .VITE_API_URL
          || "http://localhost:5069/api"
        ) as string;

      const backendOrigin =
        apiBase
          .replace(/\/+$/, "")
          .replace(/\/api$/i, "");

      setSelectedSubmission({

        id:
          String(
            submission.submissionId
          ),

        taskTitle:
          submission.taskTitle,

        submittedDate:
          submission.submittedAt,

        notes:
          submission.notesForMentor,

        status:
          submission.reviewed
            ? "reviewed"
            : "under_review",

        links:
          submission.links?.map(
            (link: any) => ({

              id:
                String(link.id),

              title:
                link.label,

              url:
                link.url,

            })
          ) || [],

        files:
          submission.links?.map(
            (link: any) => ({

              id:
                String(link.id),

              name:
                link.label,

              size:
                "Link",

              type:
                "LINK",

              url:
                link.url.startsWith(
                  "http"
                )
                  ? link.url
                  : `${backendOrigin}${link.url}`,

            })
          ) || [],

      });

      modals
        .setShowSubmissionModal(
          true
        );

    } catch (error) {

      console.error(
        "Failed to load submission",
        error
      );

    } finally {

      setIsLoadingSubmission(
        false
      );

    }

  };

  const [
  submissionEditMode,
  setSubmissionEditMode
] = useState<{
  mode: "create" | "edit";
  taskId: string;
  submissionId?: number;
} | null>(null);



  const handleViewFeedback =
  async (taskId: string) => {

    try {

      const response =
        await taskSubmissionService
          .getMySubmission(
            Number(taskId)
          );

      const submission =
        response.data;

      setSelectedFeedback({

        id:
          String(
            submission.submissionId
          ),

        taskTitle:
          submission.taskTitle,

        submittedDate:
          submission.submittedAt,

        grade:
          submission.review?.grade,

        feedback:
          submission.review?.feedback,

      });

      modals.setShowFeedbackModal(
        true
      );

    } catch (error) {

      console.error(
        "Failed to load feedback",
        error
      );

    }

  };

  const handleViewTaskDetails = (taskId: string) => {
    tasksState.setSelectedTaskDetailsId(taskId);
    setShowTaskDetailsModal(true);
  };


  const handleOpenMentorReview = (
  submissionId: string
) => {

  const submission =
    mentorFullSubmissions.find(
      (s) =>
        String(s.submissionId) === submissionId
    );

  if (!submission) {
    return;
  }

  const reviewSubmission:
  MentorSubmissionReview = {

    id: String(submission.submissionId),

    studentName: submission.menteeName,

    studentAvatar:
      submission.menteeProfilePicture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        submission.menteeName
      )}`,

    reviewStatus:
      submission.status === "Reviewed"
        ? "reviewed"
        : "pending",

    submittedAt:
      submission.submittedAt,

    submittedAtLabel:
      new Date(
        submission.submittedAt
      ).toLocaleString(),

    fileCount:
      submission.links?.length || 0,

    taskTitle:
      submission.taskTitle,

    summary:
      submission.notesForMentor || "",

    feedback:
      submission.review?.feedback || "",

    grade:
      submission.review?.grade || 0,

    attachments:
      submission.links?.map(
        (link, index) => ({

          id:
            `${submission.submissionId}-${index}`,

          name:
            link.label,

          type:
            "link" as const,

          url:
            link.url,

          size:
            "LINK",

        })
      ) || [],
  };

  setSelectedMentorSubmission(
    reviewSubmission
  );

  modals.setShowMentorSubmissionsModal(
    false
  );

  modals.setShowReviewTaskModal(
    true
  );

};
const handleSubmitMentorReview = async (
  grade: number,
  feedback: string,
  requestRevision: boolean
) => {

  if (!selectedMentorSubmission) {
    return;
  }

  try {

    await mentorTaskService.reviewSubmission(
      Number(selectedMentorSubmission.id),
      {
        grade,
        feedback,
        requestRevision,
      }
    );

    setSelectedMentorSubmission(null);

    modals.setShowReviewTaskModal(false);

    // Refresh submissions from backend
    setTimeout(async () => {

      await handleOpenMentorSubmissions(
        mentorTasksState.selectedMentorTaskId ?? ""
      );

      modals.setShowMentorSubmissionsModal(false);

    }, 0);

  } catch (error) {

    console.error(
      "Failed to submit review",
      error
    );

  }

};

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

  const handleMessageStudent = async (studentId: string) => {
    try {
      setMessagingStudentId(studentId);

      const conversation =
        await messagingService.createOrGetConversation(studentId);

      navigate(
        `/messages?conversationId=${conversation.conversationId}`,
        {
          state: {
            conversationId: conversation.conversationId,
            otherUserId: studentId,
          },
        }
      );
    } catch (error) {
      console.error("Failed to open conversation", error);
    } finally {
      setMessagingStudentId(null);
    }
  };

   const handleViewRevisionFeedback = (
  task: ClassroomTask
) => {

  setSelectedFeedback({

    id: task.id,

    taskTitle: task.title,

    grade:
      task.revisionGrade,

    feedback:
      task.revisionFeedback,

  });

  modals.setShowFeedbackModal(
    true
  );

};

const handleResubmitTask = async (
  taskId: string
) => {

  try {

    const response =
      await taskSubmissionService
        .getMySubmission(
          Number(taskId)
        );

    const submission =
      response.data;

    setEditingSubmissionId(
      submission.submissionId
    );

    setResubmitLinks(

      submission.links?.map(
        (
          link: any,
          index: number
        ) => ({

          id:
            String(index + 1),

          title:
            link.label,

          url:
            link.url,

        })
      ) || []

    );

    setResubmitNotes(
      submission.notesForMentor ||
      ""
    );

    tasksState
      .setSelectedSubmitTaskId(
        taskId
      );

    modals
      .setShowSubmitModal(
        true
      );

  } catch (error) {

    console.error(
      "Failed to load submission for resubmit",
      error
    );

  }

};


  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <section className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[28px] font-bold leading-tight text-[#1F2432]">{classroomData?.title || "Classroom"}</p>
            </div>
            {mentorUserId && Number.isFinite(classroomProgramId) ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/profile/${mentorUserId}?programId=${classroomProgramId}&tab=reviews`
                  )
                }
                className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary transition hover:text-primary-dark lg:self-center"
              >
                <span aria-hidden>💬</span>
                <span>Feedback</span>
                <span aria-hidden>→</span>
              </button>
            ) : null}
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
            onLoadComments={fetchComments}
            onOpenPostDetails={
  handleOpenPostDetails
}


            onToggleLikePost={
    handleToggleLikePost
  }
          />
        )}

{activeTab === 'schedule' && (

<ClassroomScheduleSection
  sessions={sessionsLoading ? [] : sessions}
  activePhase={classroomData?.description}
  isMentor={isMentor}
  onScheduleSession={() => {
    setEditingSession(null);

    setSessionTitle('');
    setSessionDate('');
    setSessionTime('');
    setMeetingLink('');

    setShowNewSessionModal(true);
  }}
  onViewDetails={(session) => {
    setSelectedSession(session);
    setShowSessionDetailsModal(true);
  }}
  onEditSession={(session) => {
    setEditingSession(session);

    setSessionTitle(session.title);

    setMeetingLink(session.meetingLink || '');

    const parts = session.dateLabel.split('•');

    if (parts.length === 2) {
      const datePart = parts[0].trim();
      const timePart = parts[1].trim();

      const parsedDate = new Date(`${datePart} ${timePart}`);

      if (!isNaN(parsedDate.getTime())) {
        setSessionDate(
          parsedDate.toISOString().split('T')[0]
        );

        setSessionTime(
          parsedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        );
      }
    }

    setShowNewSessionModal(true);
  }}
  onCancelSession={(session) => {
    const confirmed = window.confirm(
      `Cancel "${session.title}" session?`
    );

    if (confirmed) {
      handleCancelSession(session.id);
    }
  }}
/>

)}
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
  onViewRevisionFeedback={handleViewRevisionFeedback}
  onResubmitTask={handleResubmitTask}
/>
             <MenteeTasksSection
  title="My roadmap tasks"
  subtitle="Track progress across the current learning phase"
  taskItems={tasksState.taskItems}
  onSubmitTask={handleSubmitTask}
  onViewSubmission={handleViewSubmission}
  onViewFeedback={handleViewFeedback}
  onViewTaskDetails={handleViewTaskDetails}
  onViewRevisionFeedback={handleViewRevisionFeedback}
  onResubmitTask={handleResubmitTask}
/>
            </div>
          ))}

        {activeTab === 'roadmap' && (
         <ClassroomRoadmapSection
  roadmapId={roadmapId}
  isMentor={isMentor}
/>
        )}
{activeTab === 'students' && isMentor && (
  <ClassroomStudentsSection
    mentorStudents={studentsState.mentorStudents}

    dashboardStats={{
      studentsWaitingForReview:
        dashboardData?.studentsWaitingForReview ?? 0,

      studentsAtRisk:
        dashboardData?.studentsAtRisk ?? 0,

      averageRoadmapCompletion:
        dashboardData?.averageRoadmapCompletion ?? 0,

      activeStudents:
        dashboardData?.students?.length ?? 0,
    }}

    selectedStudentIds={studentsState.selectedStudentIds}
    isAllStudentsSelected={isAllStudentsSelected}
    onToggleSelectAllStudents={studentsState.toggleSelectAllStudents}
    onToggleStudentSelection={studentsState.toggleStudentSelection}
    onDeleteSelectedStudents={handleDeleteSelectedStudents}
onOpenMentorSubmissionsForStudent={
  handleOpenMentorSubmissionsForStudent
}
    onMessageStudent={handleMessageStudent}
    messagingStudentId={messagingStudentId}
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
  onClose={() =>
    modals.setShowSubmitModal(false)
  }
  onSubmit={
    handleConfirmTaskSubmission
  }
  taskTitle={
    tasksState.taskItems.find(
      (t) =>
        t.id ===
        tasksState.selectedSubmitTaskId
    )?.title
  }
  initialLinks={
    resubmitLinks
  }
  initialNotes={
    resubmitNotes
  }
/>

<ViewSubmissionModal
  isOpen={
    modals.showSubmissionModal
  }
  onClose={() =>
    modals
      .setShowSubmissionModal(
        false
      )
  }
  submission={
    selectedSubmission
  }
/>


<ViewFeedbackModal
  isOpen={modals.showFeedbackModal}
  onClose={() => {

    setSelectedFeedback(
      null
    );

    modals.setShowFeedbackModal(
      false
    );

  }}
  feedback={selectedFeedback}
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
        id:
          tasksState.selectedTaskDetailsId,

        title:
          tasksState.taskItems.find(
            (t) =>
              t.id ===
              tasksState.selectedTaskDetailsId
          )?.title,

        category:
          tasksState.taskItems.find(
            (t) =>
              t.id ===
              tasksState.selectedTaskDetailsId
          )?.category,

        dueDate:
          tasksState.taskItems.find(
            (t) =>
              t.id ===
              tasksState.selectedTaskDetailsId
          )?.deadline,

        description:
          tasksState.taskItems.find(
            (t) =>
              t.id ===
              tasksState.selectedTaskDetailsId
          )?.description,

        resources:
          tasksState.taskItems.find(
            (t) =>
              t.id ===
              tasksState.selectedTaskDetailsId
          )?.resources,

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

 <MentorNewSessionModal
      isOpen={showNewSessionModal}
      onClose={() => setShowNewSessionModal(false)}
      sessionTitle={sessionTitle}
      onSessionTitleChange={setSessionTitle}
      sessionDate={sessionDate}
      onSessionDateChange={setSessionDate}
      sessionTime={sessionTime}
      onSessionTimeChange={setSessionTime}
      meetingLink={meetingLink}
      onMeetingLinkChange={setMeetingLink}
onSchedule={handleScheduleSession}
  isLoading={isSchedulingSession}
    isEditMode={!!editingSession}


    />
<SessionDetailsModal
isOpen={showSessionDetailsModal}
onClose={() => setShowSessionDetailsModal(false)}
session={selectedSession}
isMentor={isMentor}
onCancelSession={handleCancelSession}
/>

<DeleteStudentModal
  open={
    !!studentsState.pendingDeleteStudent
  }
  loading={
    isDeletingStudent
  }
  studentName={
    studentsState
      .pendingDeleteStudent
      ?.name
  }
  onClose={() =>
    studentsState
      .setPendingDeleteStudent(
        null
      )
  }
  onConfirm={
    handleConfirmDeleteStudent
  }
/>

{showThreadModal &&
  selectedFeedPost && (

    <ClassroomThreadModal
      isOpen={showThreadModal}
      onClose={() =>
        setShowThreadModal(false)
      }
      thread={selectedFeedPost}
      currentUserId={
        user?.userId
      }
      programId={
        classroomProgramId
      }
      onThreadLike={
  handleToggleLikePost
}
    />

)}

      
    </Layout>
  );
};

export default ClassroomPage;