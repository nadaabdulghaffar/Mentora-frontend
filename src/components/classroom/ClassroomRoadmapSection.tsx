import { MentorRoadmap } from './roadmap/MentorRoadmap';
import { MenteeRoadmap } from './roadmap/MenteeRoadmap';
import { useToggleList } from './hooks/useToggleList';
import { useExpandableList } from './hooks/useExpandableList';

// Types
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

type MentorRoadmapListType = 'materials' | 'assignments';

type NewModuleComposerDraft = {
  title: string;
  summary: string;
  materials: string[];
  tasks: string[];
};

type MentorRoadmapProgram = {
  title: string;
  description: string;
  level: string;
  duration: string;
};

type PhaseThemeClasses = {
  accent: string;
  badgeBg: string;
  badgeText: string;
  barFrom: string;
  barTo: string;
  panelBorder: string;
  panelBg: string;
  moduleBg: string;
};

type ClassroomRoadmapSectionProps = {
  isMentor: boolean;
  mentorRoadmapProgram: MentorRoadmapProgram;
  mentorRoadmapPhases: MentorRoadmapPhase[];
  expandedMentorRoadmapPhaseIds: string[];
  expandedMentorRoadmapModuleIds: string[];
  toggleMentorRoadmapPhase: (phaseId: string) => void;
  toggleMentorRoadmapModule: (moduleId: string) => void;
  collapseAllMentorRoadmapSections: () => void;
  openAddMaterialsModal: (phaseId: string, moduleId: string, listType?: MentorRoadmapListType) => void;
  openEditRoadmapItemModal: (phaseId: string, moduleId: string, listType: MentorRoadmapListType, itemIndex: number) => void;
  openEditAssignmentTaskModal: (phaseId: string, moduleId: string, itemIndex: number) => void;
  deleteMentorRoadmapItem: (phaseId: string, moduleId: string, listType: 'materials' | 'assignments', itemIndex: number) => void;
  openNewTaskModal: (phase: string, origin?: { context: 'workflow' | 'composer' | 'roadmap'; phaseId?: string; moduleId?: string; listType?: MentorRoadmapListType }) => void;
  getRoadmapTaskPhase: (phaseTitle: string) => string;
  isNewModuleComposerOpen: (phaseId: string) => boolean;
  toggleNewModuleComposer: (phaseId: string) => void;
  newModuleComposerByPhase: Record<string, NewModuleComposerDraft>;
  updateNewModuleComposerField: (phaseId: string, field: 'title' | 'summary', value: string) => void;
  updateNewModuleComposerItem: (phaseId: string, listType: 'materials' | 'tasks', index: number, value: string) => void;
  removeNewModuleComposerItem: (phaseId: string, listType: 'materials' | 'tasks', index: number) => void;
  openComposerAddMaterialsModal: (phaseId: string) => void;
  checkedMaterialIds: string[];
  checkedTaskIds: string[];
  toggleMaterialCheck: (materialId: string) => void;
  toggleTaskCheck: (taskId: string) => void;
  roadmapPhases: RoadmapPhase[];
  phaseThemeClasses: PhaseThemeClasses[];
  getTaskProgressPercent: (tasksList: RoadmapTask[]) => number;
  expandedPhaseIds: string[];
  expandedModuleIds: string[];
  togglePhase: (phaseId: string) => void;
  toggleModule: (moduleId: string) => void;
};

const ClassroomRoadmapSection = ({
  isMentor,
  mentorRoadmapProgram,
  mentorRoadmapPhases,
  expandedMentorRoadmapPhaseIds,
  expandedMentorRoadmapModuleIds,
  toggleMentorRoadmapPhase,
  toggleMentorRoadmapModule,
  collapseAllMentorRoadmapSections,
  openAddMaterialsModal,
  openEditRoadmapItemModal,
  openEditAssignmentTaskModal,
  deleteMentorRoadmapItem,
  openNewTaskModal,
  getRoadmapTaskPhase,
  isNewModuleComposerOpen,
  toggleNewModuleComposer,
  newModuleComposerByPhase,
  updateNewModuleComposerField,
  updateNewModuleComposerItem,
  removeNewModuleComposerItem,
  openComposerAddMaterialsModal,
  checkedMaterialIds,
  checkedTaskIds,
  toggleMaterialCheck,
  toggleTaskCheck,
  roadmapPhases,
  phaseThemeClasses,
  getTaskProgressPercent,
  expandedPhaseIds,
  expandedModuleIds,
  togglePhase,
  toggleModule,
}: ClassroomRoadmapSectionProps) => {
  // Render mentor view
  if (isMentor) {
    return (
      <section className="space-y-5">
        <MentorRoadmap
          program={mentorRoadmapProgram}
          phases={mentorRoadmapPhases}
          expandedPhaseIds={expandedMentorRoadmapPhaseIds}
          expandedModuleIds={expandedMentorRoadmapModuleIds}
          onTogglePhase={toggleMentorRoadmapPhase}
          onToggleModule={toggleMentorRoadmapModule}
          onCollapseAll={collapseAllMentorRoadmapSections}
          onAddMaterials={openAddMaterialsModal}
          onEditRoadmapItem={openEditRoadmapItemModal}
          onEditAssignment={openEditAssignmentTaskModal}
          deleteRoadmapItem={deleteMentorRoadmapItem}
          openNewTaskModal={openNewTaskModal}
          getRoadmapTaskPhase={getRoadmapTaskPhase}
          isNewModuleComposerOpen={isNewModuleComposerOpen}
          toggleNewModuleComposer={toggleNewModuleComposer}
          newModuleComposerByPhase={newModuleComposerByPhase}
          updateNewModuleComposerField={updateNewModuleComposerField}
          updateNewModuleComposerItem={updateNewModuleComposerItem}
          removeNewModuleComposerItem={removeNewModuleComposerItem}
          openComposerAddMaterialsModal={openComposerAddMaterialsModal}
        />
      </section>
    );
  }

  // Render mentee view
  return (
    <section className="space-y-5">
      <MenteeRoadmap
        phases={roadmapPhases}
        expandedPhaseIds={expandedPhaseIds}
        expandedModuleIds={expandedModuleIds}
        checkedMaterialIds={checkedMaterialIds}
        checkedTaskIds={checkedTaskIds}
        onTogglePhase={togglePhase}
        onToggleModule={toggleModule}
        onToggleMaterial={toggleMaterialCheck}
        onToggleTask={toggleTaskCheck}
        getTaskProgressPercent={getTaskProgressPercent}
      />
    </section>
  );
};

export default ClassroomRoadmapSection;
