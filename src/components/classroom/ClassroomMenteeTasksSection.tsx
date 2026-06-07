import { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TaskBadge from './TaskBadge';
import type { ClassroomTask } from '../../pages/classroom/types';
import { formatTaskDeadline } from '../../pages/classroom/utils';

const CLASSROOM_SECTION_ID = 'mentee-section-classroom';

type PhaseGroup = {
  id: string;
  title: string;
  tasks: ClassroomTask[];
};

type RoadmapPhaseMeta = {
  phaseId?: number;
  title: string;
  order?: number;
};

type ClassroomMenteeTasksSectionProps = {
  taskItems: ClassroomTask[];
  roadmapPhases: RoadmapPhaseMeta[];
  hasRoadmap: boolean;
  expandedSectionIds: string[];
  onToggleSection: (sectionId: string) => void;
  onSubmitTask: (taskId: string) => void;
  onViewSubmission: (taskId: string) => void;
  onViewFeedback: (taskId: string) => void;
  onViewTaskDetails: (taskId: string) => void;
  onViewRevisionFeedback: (task: ClassroomTask) => void;
  onResubmitTask: (taskId: string) => void;
};

type MenteeTaskCardProps = {
  task: ClassroomTask;
  columnId: 'todo' | 'submitted' | 'reviewed';
  onSubmitTask: (taskId: string) => void;
  onViewSubmission: (taskId: string) => void;
  onViewFeedback: (taskId: string) => void;
  onViewTaskDetails: (taskId: string) => void;
  onViewRevisionFeedback: (task: ClassroomTask) => void;
  onResubmitTask: (taskId: string) => void;
};

function MenteeTaskCard({
  task,
  columnId,
  onSubmitTask,
  onViewSubmission,
  onViewFeedback,
  onViewTaskDetails,
  onViewRevisionFeedback,
  onResubmitTask,
}: MenteeTaskCardProps) {
  return (
    <article className="rounded-2xl border border-[#E6E9F2] bg-[#FCFCFE] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A8094]">
            {formatTaskDeadline(task.deadline) ?? task.category}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-[#1F2432]">
            {task.title}
          </h3>
        </div>
        <TaskBadge label={task.badge} tone={task.badgeTone} />
      </div>

      <p className="mt-3 text-sm leading-6 text-[#5E667D]">{task.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {columnId === 'todo' &&
          (task.isRevisionRequest ? (
            <>
              <button
                type="button"
                onClick={() => onViewRevisionFeedback(task)}
                className="rounded-xl border border-[#D5CCFF] bg-white px-4 py-2 text-sm font-semibold text-[#5B45BE]"
              >
                View Feedback
              </button>
              <button
                type="button"
                onClick={() => onResubmitTask(task.id)}
                className="rounded-xl bg-[#6E56CF] px-4 py-2 text-sm font-semibold text-white"
              >
                Resubmit
              </button>
            </>
          ) : (
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
          ))}

        {columnId === 'submitted' && (
          <button
            type="button"
            onClick={() => onViewSubmission(task.id)}
            className="rounded-xl border border-[#D5CCFF] bg-white px-4 py-2 text-sm font-semibold text-[#5B45BE]"
          >
            View Submission
          </button>
        )}

        {columnId === 'reviewed' && (
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
  );
}

function TaskStatusColumns({
  tasks,
  onSubmitTask,
  onViewSubmission,
  onViewFeedback,
  onViewTaskDetails,
  onViewRevisionFeedback,
  onResubmitTask,
}: Omit<MenteeTaskCardProps, 'task' | 'columnId'> & { tasks: ClassroomTask[] }) {
  const columns = [
    {
      id: 'todo' as const,
      title: 'To Do',
      description: 'Tasks you still need to submit',
      tasks: tasks.filter((task) => task.status === 'todo'),
    },
    {
      id: 'submitted' as const,
      title: 'Submitted',
      description: 'Tasks waiting for review',
      tasks: tasks.filter((task) => task.status === 'submitted'),
    },
    {
      id: 'reviewed' as const,
      title: 'Reviewed',
      description: 'Tasks that already received feedback',
      tasks: tasks.filter((task) => task.status === 'reviewed'),
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => (
        <div key={column.id} className="rounded-2xl border border-[#E6E9F2] bg-white p-4">
          <div className="flex items-center justify-between gap-3 border-b border-[#ECEFF6] pb-3">
            <div>
              <h3 className="text-lg font-semibold text-[#1F2432]">{column.title}</h3>
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
                <MenteeTaskCard
                  key={`${task.taskType}-${task.id}`}
                  task={task}
                  columnId={column.id}
                  onSubmitTask={onSubmitTask}
                  onViewSubmission={onViewSubmission}
                  onViewFeedback={onViewFeedback}
                  onViewTaskDetails={onViewTaskDetails}
                  onViewRevisionFeedback={onViewRevisionFeedback}
                  onResubmitTask={onResubmitTask}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ClassroomMenteeTasksSection({
  taskItems,
  roadmapPhases,
  hasRoadmap,
  expandedSectionIds,
  onToggleSection,
  onSubmitTask,
  onViewSubmission,
  onViewFeedback,
  onViewTaskDetails,
  onViewRevisionFeedback,
  onResubmitTask,
}: ClassroomMenteeTasksSectionProps) {
  const roadmapPhaseGroups = useMemo(() => {
    if (!hasRoadmap) {
      return [];
    }

    const sortedPhases = [...roadmapPhases].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const groups: PhaseGroup[] = [];

    sortedPhases.forEach((phase) => {
      const phaseId = phase.phaseId ? String(phase.phaseId) : undefined;
      const phaseTasks = taskItems.filter(
        (task) =>
          task.taskType === 'roadmap' &&
          (phaseId
            ? task.phaseId === phaseId
            : task.phaseName === phase.title)
      );

      if (phaseTasks.length > 0) {
        groups.push({
          id: `roadmap-${phaseId ?? phase.title}`,
          title: phase.title,
          tasks: phaseTasks,
        });
      }
    });

    const unmatchedRoadmapTasks = taskItems.filter(
      (task) =>
        task.taskType === 'roadmap' &&
        !groups.some((group) => group.tasks.includes(task))
    );

    if (unmatchedRoadmapTasks.length > 0) {
      groups.push({
        id: 'roadmap-unassigned',
        title: 'Roadmap',
        tasks: unmatchedRoadmapTasks,
      });
    }

    return groups;
  }, [hasRoadmap, roadmapPhases, taskItems]);

  const classroomTasks = useMemo(
    () => taskItems.filter((task) => task.taskType === 'classroom'),
    [taskItems]
  );

  const sections: PhaseGroup[] = [
    ...roadmapPhaseGroups,
    ...(classroomTasks.length > 0
      ? [
          {
            id: CLASSROOM_SECTION_ID,
            title: 'Classroom',
            tasks: classroomTasks,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-7">
      <div className="rounded-3xl border border-[#E6E9F2] bg-white p-6">
        <h1 className="text-[38px] font-bold leading-tight text-[#1F2432]">My Tasks</h1>
        <p className="mt-1 text-base text-[#6F7689]">
          Roadmap and classroom tasks grouped by learning phase
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="grid min-h-[160px] place-items-center rounded-3xl border border-dashed border-[#E3E7F0] bg-white text-center">
          <p className="px-4 text-sm text-[#8D95A8]">No tasks available yet.</p>
        </div>
      ) : (
        sections.map((section) => {
          const isExpanded = expandedSectionIds.includes(section.id);

          return (
            <div
              key={section.id}
              className="space-y-4 rounded-3xl border border-[#E6E9F2] bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6E56CF]" />
                  <p className="text-[28px] font-bold leading-none text-[#1F2432]">
                    {section.title}
                  </p>
                  <span className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-xs font-semibold text-[#7D859B]">
                    {section.tasks.length} task{section.tasks.length === 1 ? '' : 's'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSection(section.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E9F2] bg-white text-[#697188]"
                  aria-label={
                    isExpanded ? `Collapse ${section.title}` : `Expand ${section.title}`
                  }
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {isExpanded && (
                <TaskStatusColumns
                  tasks={section.tasks}
                  onSubmitTask={onSubmitTask}
                  onViewSubmission={onViewSubmission}
                  onViewFeedback={onViewFeedback}
                  onViewTaskDetails={onViewTaskDetails}
                  onViewRevisionFeedback={onViewRevisionFeedback}
                  onResubmitTask={onResubmitTask}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
