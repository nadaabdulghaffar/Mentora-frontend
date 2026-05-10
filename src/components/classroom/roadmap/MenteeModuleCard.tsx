import { ChevronDown, ChevronUp } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';
import { MenteeMaterialsList } from './MaterialsList';
import { MenteeTasksList } from './AssignmentsList';
import type { PhaseTheme } from '../constants/roadmapThemes.ts';

type RoadmapMaterial = {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'template';
  duration: string;
};

type RoadmapTask = {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'pending' | 'overdue';
};

type RoadmapModule = {
  id: string;
  title: string;
  subtitle: string;
  materials: RoadmapMaterial[];
  tasks: RoadmapTask[];
};

interface MenteeModuleCardProps {
  module: RoadmapModule;
  isExpanded: boolean;
  onToggleExpand: () => void;
  checkedMaterialIds: string[];
  checkedTaskIds: string[];
  onToggleMaterial: (materialId: string) => void;
  onToggleTask: (taskId: string) => void;
  theme: PhaseTheme;
  getTaskProgressPercent: (tasks: RoadmapTask[]) => number;
}

export const MenteeModuleCard = ({
  module,
  isExpanded,
  onToggleExpand,
  checkedMaterialIds,
  checkedTaskIds,
  onToggleMaterial,
  onToggleTask,
  theme,
  getTaskProgressPercent,
}: MenteeModuleCardProps) => {
  const moduleProgressPercent = getTaskProgressPercent(module.tasks);

  return (
    <div className={`rounded-2xl border border-[#E7EBF0] p-4 ${theme.moduleBg}`}>
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <p className="text-xl font-semibold leading-tight text-[#1F2432]">{module.title}</p>

        <div className="flex items-start gap-3">
          <div className="mt-1 w-36 max-w-[38vw] sm:w-44">
            <ProgressBar
              percentage={moduleProgressPercent}
              barFromColor={theme.barFrom}
              barToColor={theme.barTo}
              label="Module Progress"
            />
          </div>
          <div className="mt-1 text-[#6F7689]">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <MenteeMaterialsList
            materials={module.materials}
            checkedIds={checkedMaterialIds}
            onToggleCheck={onToggleMaterial}
            badgeBg={theme.badgeBg}
            badgeText={theme.badgeText}
          />

          <MenteeTasksList
            tasks={module.tasks}
            checkedIds={checkedTaskIds}
            onToggleCheck={onToggleTask}
          />
        </div>
      )}
    </div>
  );
};
