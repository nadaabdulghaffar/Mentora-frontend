import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import authAPI from '../../services/authService';
import { classroomService } from '../../services/classroomService';
import Layout from '../../shared/components/Layout';
import ClassroomTabsNav from '../../components/classroom/ClassroomTabsNav';
import ClassroomOverviewSection from '../../components/classroom/ClassroomOverviewSection';
import ClassroomScheduleSection from '../../components/classroom/ClassroomScheduleSection';
import ClassroomRoadmapSection from '../../components/classroom/ClassroomRoadmapSection';
import ClassroomRoadmapResourceSection, {
  type ClassroomRoadmapResourceData,
} from '../../components/classroom/ClassroomRoadmapResourceSection';
import ChooseRoadmapModal from '../../components/classroom/Modals/ChooseRoadmapModal';
import ClassroomRoadmapResourceModal from '../../components/classroom/Modals/ClassroomRoadmapResourceModal';
import ClassroomMentorTasksSection from '../../components/classroom/ClassroomMentorTasksSection';
import ClassroomMenteeTasksSection from '../../components/classroom/ClassroomMenteeTasksSection';
import ClassroomStudentsSection from '../../components/classroom/ClassroomStudentsSection';
import type { FeedPostProps } from '../../components/Feed';
import MentorNewSessionModal from '../../components/classroom/Modals/MentorNewSessionModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import SessionDetailsModal from '../../components/classroom/Modals/SessionDetailsModal';
import DeleteStudentModal from '../../components/classroom/Modals/DeleteStudentModal';
import { classroomFeedService } from "../../services/classroomFeedService";
import type {
  SubmissionLink
} from "../../components/classroom/Modals/SubmitTaskModal";
import { refreshOwnProfile } from '../profile/profileService';

import ClassroomThreadModal 
from "../../components/community/ClassroomThreadModal";

import {
  fetchProgramById,
  getProgramView,
  mapProgramResponseToFormData,
} from "../../services/programService";
import { taskSubmissionService }
from "../../services/taskSubmissionService";
import { useRoadmapBuilderStore }
from "../../store/roadmapBuilderStore";

import { mentorTaskService }
from "../../services/mentorTaskService";
import { classroomTaskService } from "../../services/classroomTaskService";
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
import type {
  ClassroomTab,
  ClassroomTask,
  MentorStudent,
} from './types';
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
  type CreateClassroomTaskFormValues,
  type TaskDetails,
  type AddPostAttachment,
  type MentorSubmissionSummary,
  type MentorSubmissionReview,
  type FeedbackView,
} from '../../components/classroom/Modals';
import type { BackendSubmissionResponse } from '../../components/classroom/types.ts';


const getLocalSessionDateStrings = (scheduledAtIso?: string) => {
  if (!scheduledAtIso) {
    return { dateDisplay: 'TBD', timeDisplay: 'TBD' };
  }
  const date = UTILS.parseSafeUtcDate(scheduledAtIso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  let dateDisplay = '';
  if (isSameDay(date, now)) {
    dateDisplay = 'Today';
  } else if (isSameDay(date, tomorrow)) {
    dateDisplay = 'Tomorrow';
  } else {
    dateDisplay = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  const timeDisplay = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return { dateDisplay, timeDisplay };
};

const mapSession = (session: any) => {
  const { dateDisplay, timeDisplay } = getLocalSessionDateStrings(session.scheduledAt);
  return {
    id: String(session.sessionId),
    title: session.title,
    dateLabel: `${dateDisplay} • ${timeDisplay}`,
    duration: "60 min",
    live: session.isJoinable,
    meetingLink: session.meetingLink,
    scheduledAt: session.scheduledAt,
  };
};

const mapUpcomingSession = (session: any) => {
  const { dateDisplay, timeDisplay } = getLocalSessionDateStrings(session.scheduledAt);
  return {
    title: session.title,
    dateLabel: dateDisplay,
    timeLabel: timeDisplay,
    meetingLink: session.meetingLink,
    isJoinable: Boolean(session.isJoinable),
  };
};

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://localhost:5069/api').replace(
  /\/api\/?$/,
  ''
);

const resolveAvatarUrl = (path: string | null | undefined, name: string) => {
  if (!path) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_ROOT}${path.startsWith('/') ? path : `/${path}`}`;
};

const mapAttachmentPreview = (attachment: AddPostAttachment) => ({
  id: attachment.id,
  name: attachment.name,
  type: attachment.type,
  url: attachment.url,
});

const isImageAttachmentShape = (attachment: any): boolean => {
  const type = String(attachment?.type ?? '').toLowerCase();
  const mimeType = String(attachment?.mimeType ?? attachment?.contentType ?? '').toLowerCase();
  const url = String(attachment?.url ?? '').toLowerCase();

  if (type === 'image') return true;
  if (mimeType.startsWith('image/')) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);
};

const mapApiAttachment = (attachment: any) => ({
  id: String(attachment?.id ?? `attachment-${Date.now()}`),
  name: attachment?.name || 'Attachment',
  type: isImageAttachmentShape(attachment) ? 'image' : 'file',
  url: resolveImageUrl(attachment?.url),
});

const resolveImageUrl = (url?: string | null) => {
  if (!url?.trim()) {
    return '';
  }

  const normalizedUrl = url.trim().replace(/\\/g, '/');

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5069/api') as string;
  const backendOrigin = apiBase.replace(/\/api$/i, '').replace(/\/+$/, '');

  return `${backendOrigin}${normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`}`;
};

const resolveProfileAvatar = (profilePictureUrl?: string | null, fullName?: string) => {
  const resolved = resolveImageUrl(profilePictureUrl);
  if (resolved) {
    return resolved;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}`;
};



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
    deadline?: string;
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



const ClassroomPage = ({}: Record<string, never> = {}) => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const classroomProgramId =
  Number(programId);

  const user = authAPI.getCurrentUser();
  const role = user?.role?.toLowerCase?.()?.trim?.() || '';
  const isMentor = role === 'mentor';
  const fallbackDisplayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Designer';

  const tasksState = useTasksState(CONSTANTS.initialTasks);
  const { setTaskItems } = tasksState;

  const queryClient = useQueryClient();

  const { data: pendingReviewCount = 0 } = useQuery({
    queryKey: ['pendingReviews', classroomProgramId],
    queryFn: async () => {
      if (!isMentor || !classroomProgramId) return 0;
      const res = await mentorTaskService.getProgramSubmissions(
        classroomProgramId,
        undefined,
        'Submitted'
      );
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return arr.length;
    },
    enabled: isMentor && !!classroomProgramId,
  });

  const [classroomData, setClassroomData] =
  useState<any>(null);

  const [mentorUserId, setMentorUserId] = useState<string | null>(null);

  const [roadmapId, setRoadmapId] =
  useState<number | null>(null);

  const [classroomRoadmapResource, setClassroomRoadmapResource] =
    useState<ClassroomRoadmapResourceData | null>(null);
  const [isRoadmapResourceLoading, setIsRoadmapResourceLoading] =
    useState(false);
  const [programSubDomainId, setProgramSubDomainId] = useState(0);
  const [showChooseRoadmapModal, setShowChooseRoadmapModal] = useState(false);
  const [showRoadmapResourceModal, setShowRoadmapResourceModal] = useState(false);

  const [
  dashboardData,
  setDashboardData
] = useState<any>(null);

const [
  isDashboardLoading,
  setIsDashboardLoading
] = useState(false);

  const [haveLoadedMenteeTasks, setHaveLoadedMenteeTasks] = useState(false);
  const [isPublishingClassroomTask, setIsPublishingClassroomTask] = useState(false);
  
  const [editingClassroomTaskData, setEditingClassroomTaskData] = useState<{ taskId: number; initialData: CreateClassroomTaskFormValues } | null>(null);
  const [deletingClassroomTaskId, setDeletingClassroomTaskId] = useState<number | null>(null);
  const isClassroomOwner = isMentor && String(user?.userId) === String(mentorUserId);

  const mentorTasksState = useMentorTasksState();
  const studentsState = useStudentsState([]);

  const {
  setMentorStudents
} = studentsState;

  const roadmapState = useRoadmapState(CONSTANTS.roadmapPhases);
  const modals = useClassroomModals();
const [feedPosts, setFeedPosts] =
useState<FeedPostProps[]>(
  []
);

  const [currentUserProfile, setCurrentUserProfile] = useState({
    displayName: fallbackDisplayName,
    avatarUrl: '',
  });

  const [upcomingSession, setUpcomingSession] = useState<{
    title: string;
    dateLabel: string;
    timeLabel: string;
    meetingLink?: string;
    isJoinable: boolean;
  } | null>(null);

  const [sessionToCancel, setSessionToCancel] = useState<{ id: string; title: string } | null>(null);
  const [isCancelingSession, setIsCancelingSession] = useState(false);






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
              resolveProfileAvatar(
                comment.author.profilePictureUrl,
                comment.author.fullName
              ),

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

      console.log('RAW POSTS FROM API', response?.data ?? response);

      const postsFromApi = Array.isArray(response?.data?.posts)
        ? response.data.posts
        : Array.isArray(response?.posts)
        ? response.posts
        : [];

      const mappedPosts =
        postsFromApi.map(
          (post: any) => {
            console.log('Classroom feed post.attachments:', post.attachments);
            return ({
            id: String(post.postId),
            authorId: post.author.userId,
            authorName: post.author.fullName,
            authorAvatar:
              resolveProfileAvatar(
                post.author.profilePictureUrl,
                post.author.fullName
              ),
            content: post.content,
            timestamp: new Date(
              post.createdAt
            ).toLocaleString(),
            attachments: Array.isArray(post.attachments)
              ? post.attachments
                  .map(mapApiAttachment)
                  .filter((a: any) => Boolean(a.url))
              : [],
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
          });
          }
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
  const [expandedMentorPhaseIds, setExpandedMentorPhaseIds] = useState<string[]>([]);
  const [expandedMenteeSectionIds, setExpandedMenteeSectionIds] = useState<string[]>([]);
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


  const classroomId = classroomData?.classroomId as number | undefined;

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

const taskOrderByRoadmap = useMemo(() => {
  const orderMap = new Map<string, number>();
  const sortedPhases = [...phases].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  let order = 0;

  sortedPhases.forEach((phase) => {
    const sortedTopics = [...(phase.topics ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    sortedTopics.forEach((topic) => {
      (topic.tasks ?? []).forEach((task) => {
        if (task.taskId && !orderMap.has(String(task.taskId))) {
          orderMap.set(String(task.taskId), order);
          order += 1;
        }
      });
    });
  });

  return orderMap;
}, [phases]);

const sortTasksByLearningOrder = useCallback(
  (items: ClassroomTask[]) => {
    const parseDeadline = (value?: string) => {
      if (!value) {
        return Number.MAX_SAFE_INTEGER;
      }

      const timestamp = new Date(value).getTime();
      return Number.isFinite(timestamp)
        ? timestamp
        : Number.MAX_SAFE_INTEGER;
    };

    return [...items].sort((a, b) => {
      const roadmapOrderA = taskOrderByRoadmap.get(a.id);
      const roadmapOrderB = taskOrderByRoadmap.get(b.id);

      if (
        roadmapOrderA !== undefined &&
        roadmapOrderB !== undefined &&
        roadmapOrderA !== roadmapOrderB
      ) {
        return roadmapOrderA - roadmapOrderB;
      }

      if (roadmapOrderA !== undefined) {
        return -1;
      }

      if (roadmapOrderB !== undefined) {
        return 1;
      }

      const deadlineDiff = parseDeadline(a.deadline) - parseDeadline(b.deadline);
      if (deadlineDiff !== 0) {
        return deadlineDiff;
      }

      const numericIdA = Number(a.id);
      const numericIdB = Number(b.id);

      if (Number.isFinite(numericIdA) && Number.isFinite(numericIdB)) {
        return numericIdA - numericIdB;
      }

      return a.id.localeCompare(b.id);
    });
  },
  [taskOrderByRoadmap]
);

const fetchMenteeTasks = useCallback(async () => {
  const roadmapTasks: ClassroomTask[] = [];

  if (roadmapId && phases.length) {
    const sortedPhases = [...phases].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const seenRoadmapIds = new Set<string>();

    for (const phase of sortedPhases) {
      const phaseId = Number(phase.phaseId);
      if (!phaseId) {
        continue;
      }

      const response = await taskSubmissionService.getPhaseTasks(phaseId);
      const tasks = Array.isArray(response.data) ? response.data : [];

      tasks.forEach((task: any) => {
        const id = String(task.taskId);

        if (seenRoadmapIds.has(id)) {
          return;
        }

        seenRoadmapIds.add(id);
        roadmapTasks.push(
          UTILS.mapRoadmapPhaseTaskToClassroomTask(task, {
            phaseId: phase.phaseId,
            title: phase.title,
          })
        );
      });
    }
  }

  let classroomTasks: ClassroomTask[] = [];

  if (classroomId) {
    const classroomResponse =
      await classroomTaskService.getClassroomTasks(classroomId);
    const apiTasks = Array.isArray(classroomResponse.data)
      ? classroomResponse.data
      : [];

    classroomTasks = apiTasks.map(UTILS.mapClassroomApiTaskToClassroomTask);
  }

  const mergedTasks = sortTasksByLearningOrder([
    ...roadmapTasks,
    ...classroomTasks,
  ]);

  setTaskItems(mergedTasks);

  const sectionIds = [
    ...phases
      .filter((phase) =>
        mergedTasks.some(
          (task) =>
            task.taskType === 'roadmap' &&
            task.phaseId === String(phase.phaseId)
        )
      )
      .map((phase) => `roadmap-${phase.phaseId}`),
    ...(classroomTasks.length > 0 ? ['mentee-section-classroom'] : []),
  ];

  setExpandedMenteeSectionIds((current) =>
    current.length ? current : sectionIds
  );
  setHaveLoadedMenteeTasks(true);
}, [
  roadmapId,
  phases,
  classroomId,
  setTaskItems,
  sortTasksByLearningOrder,
]);

const fetchMentorRegistry = useCallback(async () => {
  if (!isMentor || !classroomProgramId) {
    return;
  }

  const [registryResponse, classroomTasksResponse] = await Promise.all([
    mentorTaskService.getTaskRegistry(classroomProgramId),
    classroomId
      ? classroomTaskService.getClassroomTasks(classroomId)
      : Promise.resolve({ data: [] }),
  ]);

  const registry = Array.isArray(registryResponse.data)
    ? registryResponse.data
    : [];
  const classroomApiTasks = Array.isArray(classroomTasksResponse.data)
    ? classroomTasksResponse.data
    : [];

  const classroomMetaById = new Map<number, any>(
    classroomApiTasks.map((task: any) => [task.classroomTaskId, task])
  );

  const roadmapDeadlineByTaskId = new Map<string, string>();
  phases.forEach((phase) => {
    phase.topics?.forEach((topic) => {
      topic.tasks?.forEach((task) => {
        if (task.taskId && task.deadline) {
          roadmapDeadlineByTaskId.set(String(task.taskId), task.deadline);
        }
      });
    });
  });

  const groupedPhases = registry.reduce((acc: any, task: any) => {
    const phaseName = task.phaseName || 'General';
    const taskRef = UTILS.toMentorTaskRef(
      task.taskType === 'Classroom' ? 'classroom' : 'roadmap',
      task.taskId
    );
    const classroomMeta =
      task.taskType === 'Classroom'
        ? classroomMetaById.get(task.taskId)
        : undefined;

    if (!acc[phaseName]) {
      acc[phaseName] = {
        id: `phase-${phaseName}`,
        title: phaseName,
        dotClass: 'bg-[#6E56CF]',
        milestonesLabel: '0 tasks',
        tasks: [],
      };
    }

    acc[phaseName].tasks.push({
      id: taskRef,
      title: task.taskName,
      description: classroomMeta?.description?.trim() || '',
      statusLabel: task.status || 'Open',
      statusTone:
        Number(task.averageScore || 0) >= 85
          ? 'done'
          : Number(task.averageScore || 0) >= 50
            ? 'review'
            : 'risk',
      submissions: `${task.totalSubmissions || 0}/${task.totalStudents || 0}`,
      avgScore: Number(task.averageScore || 0),
      avgLabel: 'Average score',
      taskType: task.taskType === 'Classroom' ? 'Classroom' : 'Roadmap',
      taskId: task.taskId,
      deadline:
        classroomMeta?.deadline ||
        roadmapDeadlineByTaskId.get(String(task.taskId)),
    });

    acc[phaseName].milestonesLabel = `${acc[phaseName].tasks.length} task${
      acc[phaseName].tasks.length === 1 ? '' : 's'
    }`;

    return acc;
  }, {});

  const phaseViews = Object.values(groupedPhases) as MentorTaskPhaseView[];

  setMentorTaskPhasesView(phaseViews);
  setExpandedMentorPhaseIds((current) =>
    current.length ? current : phaseViews.map((phase) => phase.id)
  );

  setMentorRegistryRows(
    registry.map((task: any) => ({
      id: UTILS.toMentorTaskRef(
        task.taskType === 'Classroom' ? 'classroom' : 'roadmap',
        task.taskId
      ),
      title: task.taskName,
      phase: task.phaseName || 'General',
      submissions: `${task.totalSubmissions || 0}/${task.totalStudents || 0}`,
      avgScore: Number(task.averageScore || 0),
      taskType: task.taskType === 'Classroom' ? 'Classroom' : 'Roadmap',
      taskId: task.taskId,
      statusTone:
        Number(task.averageScore || 0) >= 85 ? 'done' : 'neutral',
      statusLabel: task.status || 'Open',
    }))
  );
}, [classroomProgramId, classroomId, isMentor, phases]);

const fetchClassroomRoadmapResource = useCallback(async () => {
  if (!classroomProgramId) {
    return;
  }

  try {
    setIsRoadmapResourceLoading(true);
    const response =
      await classroomService.getClassroomRoadmapResource(classroomProgramId);

    if (response?.success) {
      setClassroomRoadmapResource(response.data ?? null);
    } else {
      setClassroomRoadmapResource(null);
    }
  } catch (error) {
    console.error('Failed to fetch classroom roadmap resource', error);
    setClassroomRoadmapResource(null);
  } finally {
    setIsRoadmapResourceLoading(false);
  }
}, [classroomProgramId]);

const refreshMentorTaskData = useCallback(async () => {
  await fetchMentorRegistry();
}, [fetchMentorRegistry]);

const activeMissionTask = useMemo(() => {
  const orderedTasks = sortTasksByLearningOrder(tasksState.taskItems);
  return orderedTasks.find((task) => task.status === 'todo') ?? null;
}, [sortTasksByLearningOrder, tasksState.taskItems]);





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

        const [sessionsResponse, upcomingResponse] = await Promise.all([
          classroomService.getSessions(classroomProgramId),
          classroomService.getUpcomingSession(classroomProgramId).catch((err) => {
            console.error("Failed to fetch upcoming session:", err);
            return null;
          })
        ]);

        const sessionItems = Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : [];
        setSessions(sessionItems.map(mapSession));

        if (upcomingResponse?.data) {
          setUpcomingSession(mapUpcomingSession(upcomingResponse.data));
        } else {
          setUpcomingSession(null);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        setUpcomingSession(null);
      } finally {
        setSessionsLoading(false);
      }
    };

    const fetchClassroom = async () => {
      try {
        const response = await classroomService.getClassroom(classroomProgramId);

        if (response.success) {
          setClassroomData(response.data);

          const [programResponse, programDetailsResponse] = await Promise.all([
            getProgramView(classroomProgramId),
            isMentor ? fetchProgramById(classroomProgramId) : Promise.resolve(null),
          ]);

          setRoadmapId(programResponse.roadmap?.roadmapId ?? null);
          setMentorUserId(programResponse.mentorProfileId ?? null);

          if (programDetailsResponse?.data) {
            const mapped = mapProgramResponseToFormData(
              programDetailsResponse.data as Record<string, unknown>
            );
            setProgramSubDomainId(mapped.subDomainId ?? 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch classroom", error);
      }
    };

    const fetchDashboard = async () => {

  try {

    setIsDashboardLoading(true);

    if (isMentor) {
      const response = await classroomService.getClassroomDashboard(classroomProgramId);
      console.log("DASHBOARD RESPONSE:", response);

      if (!response?.success) {
        console.error('Dashboard request failed:', response?.message ?? 'Unknown error');
        return;
      }

      setDashboardData(response.data);
      const studentsFromApi = Array.isArray(response.data?.students)
        ? response.data.students
        : [];

      const mappedStudents = studentsFromApi.map((student: any) => ({
        id: student.studentId,
        name: student.fullName,
        email: student.lastCompletedItemTitle || 'No Activity Yet',
        statusLabel:
          student.tasksWaitingForReview > 0
            ? 'Needs Feedback'
            : student.isAtRisk
              ? 'Idle Student'
              : 'Module Active',
        statusTone:
          student.tasksWaitingForReview > 0
            ? 'feedback'
            : student.isAtRisk
              ? 'idle'
              : 'active',
        moduleLabel: student.lastCompletedItemTitle || 'No Activity',
        progress: student.overallCompletionPercent,
        completedTasks: student.completedTasks,
        totalTasks: student.totalTasks,
        lastActive: student.lastCompletedAt,
      }));

      setMentorStudents(mappedStudents);
    } else {
      const response = await classroomService.getClassroomCompletion(classroomProgramId);
      console.log("COMPLETION RESPONSE:", response);

      if (response?.success && response.data?.students) {
        const currentMentee = response.data.students.find(
          (s: any) => s.studentId === user?.userId
        );
        if (currentMentee) {
          // Store mentee's own overall completion percentage in dashboardData so
          // ClassroomOverviewSection receives it properly through averageRoadmapCompletion prop
          setDashboardData({
            averageRoadmapCompletion: currentMentee.overallCompletionPercent
          });
        } else {
          setDashboardData({ averageRoadmapCompletion: 0 });
        }
      }
    }

  } catch (error) {
    console.error("Failed to fetch dashboard", error);
  } finally {
    setIsDashboardLoading(false);
  }
};

    const fetchCurrentProfile = async () => {
      try {
        const profile = await refreshOwnProfile();

        if (!profile) {
          return;
        }

        setCurrentUserProfile({
          displayName: profile.displayName?.trim() || fallbackDisplayName,
          avatarUrl: resolveImageUrl(profile.avatarUrl),
        });
      } catch (error) {
        console.error('Failed to fetch current profile', error);
      }
    };

    fetchSessions();
    fetchClassroom();
    fetchFeed();
    fetchDashboard();
    fetchCurrentProfile();
    fetchClassroomRoadmapResource();
  }, [classroomProgramId,
     fetchFeed,
     fetchClassroomRoadmapResource,
     isMentor
  ]);

useEffect(() => {
  if (!isMentor || !classroomProgramId) {
    return;
  }

  refreshMentorTaskData().catch((error) => {
    console.error('Failed to fetch mentor task data', error);
  });
}, [isMentor, classroomProgramId, classroomId, refreshMentorTaskData]);

useEffect(() => {
  if (isMentor) {
    return;
  }

  if (haveLoadedMenteeTasks) {
    return;
  }

  if (!roadmapId && !classroomId) {
    return;
  }

  if (roadmapId && phases.length === 0) {
    return;
  }

  let isCancelled = false;

  fetchMenteeTasks()
    .catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch mentee tasks', error);
      }
    });


  return () => {
    isCancelled = true;
  };
}, [
  isMentor,
  roadmapId,
  phases,
  classroomId,
  haveLoadedMenteeTasks,
  fetchMenteeTasks,
]);

useEffect(() => {
  setHaveLoadedMenteeTasks(false);
  setTaskItems([]);
}, [roadmapId, classroomId, phases.length, setTaskItems]);

  const handleEditClassroomTask = (taskRef: string) => {
    const taskIdStr = taskRef.replace('classroom-', '');
    const taskId = Number(taskIdStr);
    
    // Find the task in mentorTaskPhasesView
    let taskData: any;
    for (const phase of mentorTaskPhasesView) {
      const found = phase.tasks.find(t => t.id === taskRef);
      if (found) {
        taskData = found;
        break;
      }
    }

    if (!taskData) {
      toast.error('Task not found');
      return;
    }

    // Classroom data has the attachmentUrl
    const classroomApiTasks = Array.isArray(classroomData?.tasks) ? classroomData.tasks : [];
    const meta = classroomApiTasks.find((t: any) => t.classroomTaskId === taskId);

    setEditingClassroomTaskData({
      taskId,
      initialData: {
        title: taskData.title,
        description: taskData.description || '',
        deadline: taskData.deadline || '',
        attachmentUrl: meta?.attachmentUrl || '',
      }
    });
  };

  const handleSaveEditClassroomTask = async (values: CreateClassroomTaskFormValues) => {
    if (!editingClassroomTaskData) return;
    
    setIsPublishingClassroomTask(true);
    try {
      await classroomTaskService.updateTask(editingClassroomTaskData.taskId, values);
      toast.success('Task updated successfully');
      
      // Optimistic updates
      setMentorTaskPhasesView(prev => prev.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(t => t.id === `classroom-${editingClassroomTaskData.taskId}` ? {
          ...t,
          title: values.title,
          description: values.description,
          deadline: values.deadline,
        } : t)
      })));
      setMentorRegistryRows(prev => prev.map(r => r.id === `classroom-${editingClassroomTaskData.taskId}` ? {
        ...r,
        title: values.title,
      } : r));
      setTaskItems(prev => prev.map(t => t.id === String(editingClassroomTaskData.taskId) && t.taskType === 'classroom' ? {
        ...t,
        title: values.title,
        description: values.description,
        deadline: values.deadline,
      } : t));

      setEditingClassroomTaskData(null);
      // refetch for consistency
      fetchMentorRegistry();
      fetchMenteeTasks();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update task');
    } finally {
      setIsPublishingClassroomTask(false);
    }
  };

  const handleDeleteClassroomTask = (taskRef: string) => {
    const taskIdStr = taskRef.replace('classroom-', '');
    const taskId = Number(taskIdStr);
    setDeletingClassroomTaskId(taskId);
  };

  const confirmDeleteClassroomTask = async () => {
    if (!deletingClassroomTaskId) return;

    try {
      await classroomTaskService.deleteTask(deletingClassroomTaskId);
      toast.success('Task deleted successfully');

      // Optimistic updates
      setMentorTaskPhasesView(prev => prev.map(phase => ({
        ...phase,
        tasks: phase.tasks.filter(t => t.id !== `classroom-${deletingClassroomTaskId}`)
      })));
      setMentorRegistryRows(prev => prev.filter(r => r.id !== `classroom-${deletingClassroomTaskId}`));
      setTaskItems(prev => prev.filter(t => t.id !== String(deletingClassroomTaskId) || t.taskType !== 'classroom'));

      setDeletingClassroomTaskId(null);
      // refetch for consistency
      fetchMentorRegistry();
      fetchMenteeTasks();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete task');
    }
  };

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
      toast.success('Session updated successfully');
    } else {
      await classroomService.createSession(
        classroomProgramId,
        payload
      );
      toast.success('Session scheduled successfully');
    }

    const [refreshedSessions, upcomingResponse] = await Promise.all([
      classroomService.getSessions(classroomProgramId),
      classroomService.getUpcomingSession(classroomProgramId).catch(() => null)
    ]);

    setSessions(refreshedSessions.data.map(mapSession));
    
    if (upcomingResponse?.data) {
      setUpcomingSession(mapUpcomingSession(upcomingResponse.data));
    } else {
      setUpcomingSession(null);
    }

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
    toast.error(
      editingSession
        ? 'Failed to update session. Please try again.'
        : 'Failed to schedule session. Please try again.'
    );
  } finally {
    setIsSchedulingSession(false);
  }
};



const handleCancelSession = async (sessionId: string) => {
  try {
    setIsCancelingSession(true);
    await classroomService.cancelSession(Number(sessionId));

    const [refreshedSessions, upcomingResponse] = await Promise.all([
      classroomService.getSessions(classroomProgramId),
      classroomService.getUpcomingSession(classroomProgramId).catch(() => null)
    ]);

    setSessions(refreshedSessions.data.map(mapSession));

    if (upcomingResponse?.data) {
      setUpcomingSession(mapUpcomingSession(upcomingResponse.data));
    } else {
      setUpcomingSession(null);
    }

    setShowSessionDetailsModal(false);
    setSessionToCancel(null);

    toast.success('Session cancelled successfully');
  } catch (error) {
    console.error('Failed to cancel session:', error);
    toast.error('Failed to cancel session. Please try again.');
  } finally {
    setIsCancelingSession(false);
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

      const filteredSubmissions = submissions.filter(
        (submission: BackendSubmissionResponse) =>
          UTILS.submissionMatchesTaskRef(submission, taskId)
      );

      const visibleSubmissions = filteredSubmissions.filter(
        (submission: BackendSubmissionResponse) =>
          UTILS.isSubmissionVisibleInMentorModal(submission)
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

      studentId:
        submission.menteeProfileId,

      studentName:
        submission.menteeName,

      studentAvatar: resolveAvatarUrl(submission.menteeProfilePicture, submission.menteeName),

      submittedAt:
        submission.submittedAt,

      fileCount:
        submission.links?.length || 0,

      reviewStatus: UTILS.mapMentorSubmissionReviewStatus(submission),
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

            studentId:
              submission.menteeProfileId,

            studentName:
              submission.menteeName,

            studentAvatar: resolveAvatarUrl(submission.menteeProfilePicture, submission.menteeName),

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

  const handlePublishNewMentorTask = async (
    values: CreateClassroomTaskFormValues
  ) => {
    if (!classroomId) {
      toast.error('Classroom is not ready yet. Please try again.');
      return;
    }

    const deadline = new Date(`${values.deadline}T23:59:59`).toISOString();

    try {
      setIsPublishingClassroomTask(true);

      await classroomTaskService.createTask(classroomId, {
        title: values.title,
        description: values.description,
        attachmentUrl: values.attachmentUrl,
        deadline,
      });

      modals.setShowNewTaskModal(false);
      toast.success('Task published successfully');
      await refreshMentorTaskData();
    } catch (error) {
      console.error('Failed to publish classroom task', error);
      toast.error('Failed to publish task. Please try again.');
    } finally {
      setIsPublishingClassroomTask(false);
    }
  };

  const handleToggleMenteeSection = (sectionId: string) => {
    setExpandedMenteeSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
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

      const dashboardResponse =
        await classroomService.getClassroomDashboard(classroomProgramId);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }

      toast.success('Student removed successfully');

    } catch (
      error
    ) {

      console.error(
        "Failed to delete student",
        error
      );

      toast.error('Failed to remove student. Please try again.');

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

      } else if (selectedTask.taskType === 'classroom') {
        await taskSubmissionService.createSubmission(0, {
          ...payload,
          classroomTaskId: Number(selectedTask.id),
        });
      } else {
        await taskSubmissionService.createSubmission(
          Number(selectedTask.id),
          payload
        );
      }

      setEditingSubmissionId(null);
      await fetchMenteeTasks();

      tasksState
        .setSelectedSubmitTaskId(
          ""
        );

      modals
        .setShowSubmitModal(
          false
        );

      toast.success('Submission sent successfully');

    } catch (error) {

      console.error(
        "Failed to submit task",
        error
      );

      toast.error('Failed to submit task. Please try again.');

    }

  };

  const handleOverviewSubmitTask = () => {
    if (activeMissionTask) {
      handleSubmitTask(activeMissionTask.id);
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
    attachments,
  }: {
    content: string;
    attachments: AddPostAttachment[];
  }) => {

    try {

      const attachmentPayload = attachments
        .map(mapAttachmentPreview)
        .filter((a) => Boolean(a.url?.trim()) && !a.url.startsWith('blob:'));

      const createResponse = await classroomFeedService.createPost(
        classroomProgramId,
        content,
        attachmentPayload
      );

      const createdPost = createResponse?.data;

      if (createdPost) {
        setFeedPosts((current) => [
          {
            id: String(createdPost.postId),
            authorId: createdPost.author?.userId,
            authorName: createdPost.author?.fullName || currentUserProfile.displayName,
            authorAvatar:
              resolveImageUrl(createdPost.author?.profilePictureUrl) ||
              currentUserProfile.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserProfile.displayName)}`,
            content: createdPost.content,
            timestamp: new Date(createdPost.createdAt).toLocaleString(),
            attachments: Array.isArray(createdPost.attachments)
              ? createdPost.attachments.map(mapApiAttachment).filter((a: any) => Boolean(a.url))
              : [],
            likes: createdPost.likesCount ?? 0,
            likedByMe: createdPost.likedByMe ?? false,
            comments: [],
            variant: 'classroom',
            canEdit: true,
            canDelete: true,
          },
          ...current,
        ]);
      } else {
        setFeedPosts((current) => [
          {
            id: `temp-${Date.now()}`,
            authorId: user?.userId ? String(user.userId) : 'current-user',
            authorName: currentUserProfile.displayName,
            authorAvatar:
              currentUserProfile.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserProfile.displayName)}`,
            content,
            timestamp: 'Just now',
            attachments: attachmentPayload,
            likes: 0,
            likedByMe: false,
            comments: [],
            variant: 'classroom',
            canEdit: true,
            canDelete: true,
          },
          ...current,
        ]);
      }

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
      const attachmentPayload = payload.attachments
        .map(mapAttachmentPreview)
        .filter((a) => Boolean(a.url?.trim()) && !a.url.startsWith('blob:'));

      await classroomFeedService.updatePost(
        classroomProgramId,
        Number(postId),
        payload.content,
        attachmentPayload
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

    studentId: submission.menteeProfileId,

    studentName: submission.menteeName,

    studentAvatar: resolveAvatarUrl(submission.menteeProfilePicture, submission.menteeName),

    reviewStatus: UTILS.mapMentorSubmissionReviewStatus(submission),

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

    toast.success(
      requestRevision
        ? 'Revision requested successfully'
        : 'Submission reviewed successfully'
    );

    queryClient.invalidateQueries({ queryKey: ['pendingReviews', classroomProgramId] });

    await refreshMentorTaskData();

    if (mentorTasksState.selectedMentorTaskId) {
      await handleOpenMentorSubmissions(
        mentorTasksState.selectedMentorTaskId
      );
      modals.setShowMentorSubmissionsModal(true);
    }

  } catch (error) {

    console.error(
      "Failed to submit review",
      error
    );

    toast.error('Failed to submit review. Please try again.');

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
            {!isMentor && mentorUserId && Number.isFinite(classroomProgramId) ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/profile/${mentorUserId}?programId=${classroomProgramId}&tab=reviews`
                  )
                }
                className="inline-flex h-11 items-center gap-2 self-start rounded-xl border border-[#D6DBE8] bg-white px-4 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F4F6FA] lg:self-center"
              >
                <span aria-hidden>💬</span>
                <span>Feedback</span>
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
            pendingReviewCount={pendingReviewCount}
            currentUserId={user?.userId ?? 'current-user'}
            currentUserName={currentUserProfile.displayName}
            currentUserAvatarUrl={currentUserProfile.avatarUrl}
            progressPercent={dashboardData?.averageRoadmapCompletion ?? 0}
            upcomingSession={upcomingSession}
            activeMissionTitle={activeMissionTask?.title ?? null}
            onRequestPostEdit={handleRequestPostEdit}
            onPostDelete={handleDeleteFeedPost}
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

    if (session.scheduledAt) {
      const parsedDate = UTILS.parseSafeUtcDate(session.scheduledAt);

      if (!isNaN(parsedDate.getTime())) {
        const localYear = parsedDate.getFullYear();
        const localMonth = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const localDay = String(parsedDate.getDate()).padStart(2, '0');
        setSessionDate(`${localYear}-${localMonth}-${localDay}`);

        const localHour = String(parsedDate.getHours()).padStart(2, '0');
        const localMinute = String(parsedDate.getMinutes()).padStart(2, '0');
        setSessionTime(`${localHour}:${localMinute}`);
      }
    }

    setShowNewSessionModal(true);
  }}
  onCancelSession={(session) => {
    setSessionToCancel({ id: session.id, title: session.title });
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
              onAddNewTask={handleOpenNewMentorTaskModal}
              isClassroomOwner={isClassroomOwner}
              onEditTask={handleEditClassroomTask}
              onDeleteTask={handleDeleteClassroomTask}
            />
          ) : (
            <ClassroomMenteeTasksSection
              taskItems={tasksState.taskItems}
              roadmapPhases={phases}
              hasRoadmap={Boolean(roadmapId)}
              expandedSectionIds={expandedMenteeSectionIds}
              onToggleSection={handleToggleMenteeSection}
              onSubmitTask={handleSubmitTask}
              onViewSubmission={handleViewSubmission}
              onViewFeedback={handleViewFeedback}
              onViewTaskDetails={handleViewTaskDetails}
              onViewRevisionFeedback={handleViewRevisionFeedback}
              onResubmitTask={handleResubmitTask}
            />
          ))}

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {classroomRoadmapResource && !isRoadmapResourceLoading && (
              <ClassroomRoadmapResourceSection
                programId={classroomProgramId}
                isMentor={isMentor}
                resource={classroomRoadmapResource}
                onReplace={
                  isMentor ? () => setShowRoadmapResourceModal(true) : undefined
                }
                onResourceChanged={fetchClassroomRoadmapResource}
              />
            )}
            <ClassroomRoadmapSection
              roadmapId={roadmapId}
              isMentor={isMentor}
              hasClassroomResource={Boolean(classroomRoadmapResource)}
              isResourceLoading={isRoadmapResourceLoading}
              onChooseRoadmap={
                isMentor ? () => setShowChooseRoadmapModal(true) : undefined
              }
              onUploadRoadmap={
                isMentor ? () => setShowRoadmapResourceModal(true) : undefined
              }
            />
          </div>
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
          onPublish={handlePublishNewMentorTask}
          isPublishing={isPublishingClassroomTask}
        />

        <ChooseRoadmapModal
          isOpen={showChooseRoadmapModal}
          onClose={() => setShowChooseRoadmapModal(false)}
          programId={classroomProgramId}
          subDomainId={programSubDomainId}
          onSuccess={(attachedRoadmapId) => {
            setRoadmapId(attachedRoadmapId);
            loadForView(attachedRoadmapId);
          }}
        />

        <ClassroomRoadmapResourceModal
          isOpen={showRoadmapResourceModal}
          onClose={() => setShowRoadmapResourceModal(false)}
          programId={classroomProgramId}
          onSuccess={fetchClassroomRoadmapResource}
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

        <MentorNewTaskModal
          isOpen={!!editingClassroomTaskData}
          onClose={() => setEditingClassroomTaskData(null)}
          onPublish={handleSaveEditClassroomTask}
          isPublishing={isPublishingClassroomTask}
          initialData={editingClassroomTaskData?.initialData}
        />

        {deletingClassroomTaskId && (
          <ConfirmationModal
            isOpen={true}
            onCancel={() => setDeletingClassroomTaskId(null)}
            onConfirm={confirmDeleteClassroomTask}
            title="Delete Classroom Task"
            message="Are you sure you want to delete this task? This action cannot be undone, but existing student submissions will remain in the database."
            confirmText="Delete Task"
            variant="danger"
          />
        )}

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
              .find((task) => task.id === mentorTasksState.selectedMentorTaskId)?.title ??
            mentorRegistryRows.find(
              (row) => row.id === mentorTasksState.selectedMentorTaskId
            )?.title
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
          authorAvatarUrl={currentUserProfile.avatarUrl}
          authorName={currentUserProfile.displayName}
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
  studentId={
    studentsState
      .pendingDeleteStudent
      ?.id
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
      onClose={() => {
        setShowThreadModal(false);
        void fetchFeed();
      }}
      thread={selectedFeedPost}
      currentUserId={
        user?.userId
      }
      currentUserAvatar={
        currentUserProfile.avatarUrl
      }
      programId={
        classroomProgramId
      }
      onThreadLike={
  handleToggleLikePost
}
    />

)}

      
      <ConfirmationModal
        isOpen={!!sessionToCancel}
        title="Cancel Session?"
        message="Are you sure you want to cancel this session? This action cannot be undone."
        confirmText="Cancel Session"
        cancelText="Keep Session"
        variant="danger"
        isLoading={isCancelingSession}
        onConfirm={() => {
          if (sessionToCancel) handleCancelSession(sessionToCancel.id);
        }}
        onCancel={() => {
          if (!isCancelingSession) setSessionToCancel(null);
        }}
      />
    </Layout>
  );
};

export default ClassroomPage;