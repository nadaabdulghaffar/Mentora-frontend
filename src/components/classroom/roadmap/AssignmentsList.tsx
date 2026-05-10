import { Pencil, Trash2, Plus, Check } from 'lucide-react';
import { IconButton } from '../common/IconButton';

type RoadmapTask = {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'pending' | 'overdue';
};

interface AssignmentsListProps {
  assignments: string[];
  onAddClick: () => void;
  onEditClick: (index: number) => void;
  onDeleteClick: (index: number) => void;
}

export const MentorAssignmentsList = ({
  assignments,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: AssignmentsListProps) => {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6F7689]">Assignments</p>
        <button
          type="button"
          onClick={onAddClick}
          className="text-[#49B1A2]"
          aria-label="Add assignment"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {assignments.map((assignment, index) => (
          <div key={assignment} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FC] px-3 py-2 text-base text-[#2E3649]">
            <p>{assignment}</p>
            <div className="flex items-center gap-1">
              <IconButton
                icon={<Pencil size={14} />}
                onClick={() => onEditClick(index)}
                variant="edit"
                ariaLabel="Edit assignment"
              />
              <IconButton
                icon={<Trash2 size={14} />}
                onClick={() => onDeleteClick(index)}
                variant="delete"
                ariaLabel="Delete assignment"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TasksListProps {
  tasks: RoadmapTask[];
  checkedIds: string[];
  onToggleCheck: (taskId: string) => void;
}

export const MenteeTasksList = ({
  tasks,
  checkedIds,
  onToggleCheck,
}: TasksListProps) => {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5E48C3]">Tasks</p>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E8F0] bg-[#F7F8FC] px-3 py-3 shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => onToggleCheck(task.id)}
                aria-pressed={checkedIds.includes(task.id)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition ${
                  checkedIds.includes(task.id)
                    ? 'border-[#0E7A5F] bg-[#DDF6F0] text-[#0E7A5F]'
                    : 'border-[#C9D4EA] text-[#8B95A8]'
                }`}
              >
                {checkedIds.includes(task.id) && <Check size={14} strokeWidth={2.5} />}
              </button>
              <div>
                <p className="font-semibold leading-tight text-[#202738]">{task.title}</p>
                <p className="text-sm text-[#6E7589]">{task.subtitle}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${
                checkedIds.includes(task.id)
                  ? 'bg-[#DDF6F0] text-[#0F7E62]'
                  : 'bg-[#E8EEFF] text-[#4763D8]'
              }`}
            >
              {checkedIds.includes(task.id) ? 'completed' : 'to do'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
