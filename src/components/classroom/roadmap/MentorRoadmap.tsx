import { BarChart3, Clock3, Layers, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { MentorModuleCard } from './MentorModuleCard';
import { NewModuleComposer } from './NewModuleComposer';

type MentorRoadmapModule = {
  id: string;
  title: string;
  description?: string;
  materials: string[];
  assignments: string[];
};

type MentorRoadmapPhase = {
  id: string;
  title: string;
  modulesCount: number;
  tasksCount: number;
  modules: MentorRoadmapModule[];
};

type MentorRoadmapProgram = {
  title: string;
  description: string;
  level: string;
  duration: string;
};

type NewModuleComposerDraft = {
  title: string;
  summary: string;
  materials: string[];
  tasks: string[];
};

type MentorRoadmapListType = 'materials' | 'assignments';

interface MentorRoadmapProps {
  program: MentorRoadmapProgram;
  phases: MentorRoadmapPhase[];
  expandedPhaseIds: string[];
  expandedModuleIds: string[];
  onTogglePhase: (phaseId: string) => void;
  onToggleModule: (moduleId: string) => void;
  onCollapseAll: () => void;
  onAddMaterials: (phaseId: string, moduleId: string) => void;
  onEditRoadmapItem: (phaseId: string, moduleId: string, listType: MentorRoadmapListType, itemIndex: number) => void;
  onEditAssignment: (phaseId: string, moduleId: string, itemIndex: number) => void;
  deleteRoadmapItem: (phaseId: string, moduleId: string, listType: MentorRoadmapListType, itemIndex: number) => void;
  openNewTaskModal: (phase: string, origin?: any) => void;
  getRoadmapTaskPhase: (phaseTitle: string) => string;
  isNewModuleComposerOpen: (phaseId: string) => boolean;
  toggleNewModuleComposer: (phaseId: string) => void;
  newModuleComposerByPhase: Record<string, NewModuleComposerDraft>;
  updateNewModuleComposerField: (phaseId: string, field: 'title' | 'summary', value: string) => void;
  updateNewModuleComposerItem: (phaseId: string, listType: 'materials' | 'tasks', index: number, value: string) => void;
  removeNewModuleComposerItem: (phaseId: string, listType: 'materials' | 'tasks', index: number) => void;
  openComposerAddMaterialsModal: (phaseId: string) => void;
}

export const MentorRoadmap = ({
  program,
  phases,
  expandedPhaseIds,
  expandedModuleIds,
  onTogglePhase,
  onToggleModule,
  onCollapseAll,
  onAddMaterials,
  onEditRoadmapItem,
  onEditAssignment,
  deleteRoadmapItem,
  openNewTaskModal,
  getRoadmapTaskPhase,
  isNewModuleComposerOpen,
  toggleNewModuleComposer,
  newModuleComposerByPhase,
  updateNewModuleComposerField,
  updateNewModuleComposerItem,
  removeNewModuleComposerItem,
  openComposerAddMaterialsModal,
}: MentorRoadmapProps) => {
  return (
    <>
      {/* Program Header */}
      <div className="rounded-3xl border border-[#E6E9F2] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold leading-tight text-[#1F2432]">{program.title}</h2>
            <p className="mt-2 text-lg leading-relaxed text-[#626B82]">{program.description}</p>
          </div>

          <div className="space-y-2 rounded-2xl bg-[#F7F8FC] px-4 py-3 text-sm font-semibold text-[#4D5670]">
            <p className="flex items-center gap-2">
              <BarChart3 size={14} className="text-[#7A67D4]" />
              Level: {program.level}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 size={14} className="text-[#7A67D4]" />
              Duration: {program.duration}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Structure */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-3xl font-bold leading-tight text-[#1F2432]">Portfolio Structure</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCollapseAll}
              className="text-sm font-semibold text-[#7A67D4]"
            >
              Collapse all sections
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#EDE7FF] px-4 text-sm font-semibold text-[#4F3CB9]"
            >
              <Plus size={14} />
              Add Phase
            </button>
          </div>
        </div>

        {/* Phases List */}
        <div className="space-y-4">
          {phases.map((phase) => {
            const isPhaseOpen = expandedPhaseIds.includes(phase.id);

            return (
              <div key={phase.id} className="rounded-3xl border border-[#E6E9F2] bg-[#FCFDFF] p-4">
                <button
                  type="button"
                  onClick={() => onTogglePhase(phase.id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ECE9FB] text-[#5E48C3]">
                      <Layers size={15} />
                    </span>
                    <div>
                      <p className="text-2xl font-bold leading-tight text-[#1F2432]">{phase.title}</p>
                      <p className="text-base text-[#6F7689]">{phase.modulesCount} Modules • {phase.tasksCount} Tasks</p>
                    </div>
                  </div>
                  <span className="text-[#6F7689]">{isPhaseOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                </button>

                {isPhaseOpen && (
                  <div className="mt-4 space-y-3">
                    {/* Modules */}
                    {phase.modules.map((module) => (
                      <MentorModuleCard
                        key={module.id}
                        module={module}
                        phaseId={phase.id}
                        isExpanded={expandedModuleIds.includes(module.id)}
                        onToggleExpand={() => onToggleModule(module.id)}
                        onAddMaterials={onAddMaterials}
                        onEditMaterial={(phaseId, moduleId, index) => onEditRoadmapItem(phaseId, moduleId, 'materials', index)}
                        onDeleteMaterial={(phaseId, moduleId, index) => deleteRoadmapItem(phaseId, moduleId, 'materials', index)}
                        onAddAssignment={() => openNewTaskModal(getRoadmapTaskPhase(phase.title))}
                        onEditAssignment={onEditAssignment}
                        onDeleteAssignment={(phaseId, moduleId, index) => deleteRoadmapItem(phaseId, moduleId, 'assignments', index)}
                      />
                    ))}

                    {/* New Module Composer */}
                    <NewModuleComposer
                      isOpen={isNewModuleComposerOpen(phase.id)}
                      phaseTitle={phase.title}
                      phaseId={phase.id}
                      draft={newModuleComposerByPhase[phase.id] || { title: '', summary: '', materials: [], tasks: [] }}
                      onToggleOpen={() => toggleNewModuleComposer(phase.id)}
                      onTitleChange={(value) => updateNewModuleComposerField(phase.id, 'title', value)}
                      onSummaryChange={(value) => updateNewModuleComposerField(phase.id, 'summary', value)}
                      onMaterialChange={(index, value) => updateNewModuleComposerItem(phase.id, 'materials', index, value)}
                      onTaskChange={(index, value) => updateNewModuleComposerItem(phase.id, 'tasks', index, value)}
                      onRemoveMaterial={(index) => removeNewModuleComposerItem(phase.id, 'materials', index)}
                      onRemoveTask={(index) => removeNewModuleComposerItem(phase.id, 'tasks', index)}
                      onAddMaterial={() => openComposerAddMaterialsModal(phase.id)}
                      onAddTask={() => openNewTaskModal(getRoadmapTaskPhase(phase.title), { context: 'composer', phaseId: phase.id })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
