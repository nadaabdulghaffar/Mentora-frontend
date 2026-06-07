import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { formatTaskDeadline } from '../../pages/classroom/utils';

type MentorTaskCard = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: 'done' | 'review' | 'risk';
  submissions: string;
  avgScore: number;
  avgLabel: string;
  deadline?: string;
};

type MentorTaskPhaseView = {
  id: string;
  title: string;
  dotClass: string;
  milestonesLabel: string;
  tasks: MentorTaskCard[];
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

type ClassroomMentorTasksSectionProps = {
  mentorTaskPhasesView: MentorTaskPhaseView[];
  expandedMentorPhaseIds: string[];
  onTogglePhase: (phaseId: string) => void;
  onOpenSubmissions: (taskId: string, filter?: 'all') => void;
  mentorRegistryRows: MentorRegistryRow[];
  onAddNewTask: () => void;
};

type WorkflowTaskCardProps = MentorTaskCard & {
  onViewSubmissions: () => void;
};

function MentorWorkflowTaskCard({
  statusLabel,
  statusTone,
  title,
  description,
  submissions,
  avgScore,
  avgLabel,
  deadline,
  onViewSubmissions,
}: WorkflowTaskCardProps) {
  const badgeClasses =
    statusTone === 'done'
      ? 'bg-[#DDF6F0] text-[#0E7A5F]'
      : statusTone === 'risk'
        ? 'bg-[#FFE6EA] text-[#AF2F4D]'
        : 'bg-[#EEE8FF] text-[#5E48C3]';

  const scoreClasses = avgScore >= 85 ? 'text-[#0E7A5F]' : 'text-[#B03A49]';

  return (
    <div className="rounded-2xl border border-[#E6E9F2] bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${badgeClasses}`}>
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 text-[22px] font-semibold leading-tight text-[#202738]">{title}</p>
      <p className="mt-1 text-xs font-medium text-[#7D859B]">
        {formatTaskDeadline(deadline) ?? 'No deadline set'}
      </p>
      <p className="mt-1 text-sm text-[#6E7589]">{description}</p>

      <div className="mt-4 flex items-end justify-between border-t border-[#ECEFF6] pt-3">
        <div className="flex flex-col items-start gap-2">
          <p className="text-xs font-medium text-[#7D859B]">{submissions} Submissions</p>
          <button
            type="button"
            onClick={onViewSubmissions}
            className="inline-flex h-9 items-center rounded-lg border border-[#D9DEEA] bg-white px-3 text-xs font-semibold text-[#4D5670] transition hover:bg-[#F7F8FC]"
          >
            View Submissions
          </button>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A91A5]">{avgLabel}</p>
          <p className={`text-3xl font-bold leading-none ${scoreClasses}`}>{avgScore}%</p>
        </div>
      </div>
    </div>
  );
}

export default function ClassroomMentorTasksSection({
  mentorTaskPhasesView,
  expandedMentorPhaseIds,
  onTogglePhase,
  onOpenSubmissions,
  mentorRegistryRows,
  onAddNewTask,
}: ClassroomMentorTasksSectionProps) {
  return (
    <>
      <div className="rounded-3xl border border-[#E6E9F2] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[38px] font-bold leading-tight text-[#1F2432]">Task Management Workflow</h1>
            <p className="text-base text-[#6F7689]">Manage task deadlines and monitor key project results</p>
          </div>
          <button
            type="button"
            onClick={onAddNewTask}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5E4BC5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F3DB0]"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add new task
          </button>
        </div>
      </div>

      <div className="space-y-7">
        {mentorTaskPhasesView.length === 0 ? (
          <div className="grid min-h-[160px] place-items-center rounded-3xl border border-dashed border-[#E3E7F0] bg-white text-center">
            <p className="px-4 text-sm text-[#8D95A8]">
              No tasks yet. Use &quot;Add new task&quot; to publish a classroom task.
            </p>
          </div>
        ) : (
          mentorTaskPhasesView.map((phase) => {
            const isPhaseExpanded = expandedMentorPhaseIds.includes(phase.id);

            return (
              <div key={phase.id} className="space-y-4 rounded-3xl border border-[#E6E9F2] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${phase.dotClass}`} />
                    <p className="text-[28px] font-bold leading-none text-[#1F2432]">{phase.title}</p>
                    <span className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-xs font-semibold text-[#7D859B]">
                      {phase.milestonesLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTogglePhase(phase.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E9F2] bg-white text-[#697188]"
                    aria-label={isPhaseExpanded ? `Collapse ${phase.title}` : `Expand ${phase.title}`}
                  >
                    {isPhaseExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isPhaseExpanded &&
                  (phase.tasks.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {phase.tasks.map((task) => (
                        <MentorWorkflowTaskCard
                          key={task.id}
                          {...task}
                          onViewSubmissions={() => onOpenSubmissions(task.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid min-h-[122px] place-items-center rounded-2xl border border-dashed border-[#E3E7F0] bg-white text-center">
                      <p className="text-sm text-[#8D95A8]">No tasks in this phase yet.</p>
                    </div>
                  ))}
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-3xl border border-[#E6E9F2] bg-white p-6">
        <h2 className="text-[30px] font-bold leading-tight text-[#1F2432]">Full Task Registry</h2>
        <p className="mt-1 text-sm text-[#6F7689]">All active curriculum items across all phases</p>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8A91A5]">
                <th className="px-3 py-2">Task Description</th>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Submissions</th>
                <th className="px-3 py-2">Avg Score</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mentorRegistryRows.map((row) => (
                <tr key={row.id} className="rounded-xl bg-[#FCFCFE] text-base text-[#2B3243]">
                  <td className="px-3 py-3">
                    <p className="text-[15px] font-semibold text-[#1F2432]">{row.title}</p>
                  </td>
                  <td className="px-3 py-3 text-[15px] font-medium text-[#3E4559]">{row.phase}</td>
                  <td className="px-3 py-3 text-[15px] font-medium text-[#3E4559]">{row.submissions}</td>
                  <td className="px-3 py-3 text-[15px] font-semibold text-[#0E7A5F]">{row.avgScore}%</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                        row.statusTone === 'done' ? 'bg-[#DDF6F0] text-[#0E7A5F]' : 'bg-[#EFF2F7] text-[#505A73]'
                      }`}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenSubmissions(row.id, 'all')}
                      className="inline-flex h-10 items-center rounded-lg border border-[#D5CCFF] bg-white px-4 text-sm font-semibold text-[#5B45BE] shadow-[0_1px_2px_rgba(91,69,190,0.12)] transition hover:bg-[#F7F4FF]"
                    >
                      See Submission
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
