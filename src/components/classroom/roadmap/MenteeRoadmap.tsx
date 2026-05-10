import { ChevronDown, ChevronUp } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';
import { MenteeModuleCard } from './MenteeModuleCard';
import { PHASE_THEMES } from '../constants/roadmapThemes.ts';

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

type RoadmapPhase = {
  id: string;
  title: string;
  subtitle: string;
  progressLabel: string;
  modules: RoadmapModule[];
};

interface MenteeRoadmapProps {
  phases: RoadmapPhase[];
  expandedPhaseIds: string[];
  expandedModuleIds: string[];
  checkedMaterialIds: string[];
  checkedTaskIds: string[];
  onTogglePhase: (phaseId: string) => void;
  onToggleModule: (moduleId: string) => void;
  onToggleMaterial: (materialId: string) => void;
  onToggleTask: (taskId: string) => void;
  getTaskProgressPercent: (tasks: RoadmapTask[]) => number;
}

export const MenteeRoadmap = ({
  phases,
  expandedPhaseIds,
  expandedModuleIds,
  checkedMaterialIds,
  checkedTaskIds,
  onTogglePhase,
  onToggleModule,
  onToggleMaterial,
  onToggleTask,
  getTaskProgressPercent,
}: MenteeRoadmapProps) => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold leading-tight text-[#1F2432]">Your Roadmap</h1>
        <p className="text-base text-[#697188]">Sharpen your skills through step-by-step challenges and expert tips.</p>
      </div>

      <div className="space-y-5">
        {phases.map((phase, phaseIndex) => {
          const theme = PHASE_THEMES[phaseIndex % PHASE_THEMES.length];
          const phaseTaskProgress = phase.modules.flatMap((module) => module.tasks);
          const phaseProgressPercent = getTaskProgressPercent(phaseTaskProgress);

          return (
            <div key={phase.id} className={`space-y-4 rounded-2xl border p-4 shadow-sm ${theme.panelBorder} ${theme.panelBg}`}>
              <button
                type="button"
                onClick={() => onTogglePhase(phase.id)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${theme.badgeBg} text-sm font-bold ${theme.badgeText}`}>
                    {phase.id === 'phase-1' ? '01' : phase.id === 'phase-2' ? '02' : '03'}
                  </div>
                  <div>
                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.accent}`}>{phase.title}</p>
                    <p className="text-2xl font-semibold leading-tight text-[#1F2432]">{phase.subtitle}</p>
                    <p className="text-sm text-[#6F7689]">{phase.progressLabel}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 w-44 max-w-[42vw] sm:w-56">
                    <ProgressBar
                      percentage={phaseProgressPercent}
                      barFromColor={theme.barFrom}
                      barToColor={theme.barTo}
                      label="Phase Progress"
                    />
                  </div>
                  <div className="mt-1 text-[#6F7689]">
                    {expandedPhaseIds.includes(phase.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </button>

              {expandedPhaseIds.includes(phase.id) && (
                <div className="space-y-3">
                  {phase.modules.map((module) => (
                    <MenteeModuleCard
                      key={module.id}
                      module={module}
                      isExpanded={expandedModuleIds.includes(module.id)}
                      onToggleExpand={() => onToggleModule(module.id)}
                      checkedMaterialIds={checkedMaterialIds}
                      checkedTaskIds={checkedTaskIds}
                      onToggleMaterial={onToggleMaterial}
                      onToggleTask={onToggleTask}
                      theme={theme}
                      getTaskProgressPercent={getTaskProgressPercent}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
