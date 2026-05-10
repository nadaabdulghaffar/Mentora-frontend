import { ChevronDown, ChevronUp } from 'lucide-react';
import { MentorMaterialsList } from './MaterialsList';
import { MentorAssignmentsList } from './AssignmentsList';

type MentorRoadmapModule = {
  id: string;
  title: string;
  description?: string;
  materials: string[];
  assignments: string[];
};

interface MentorModuleCardProps {
  module: MentorRoadmapModule;
  phaseId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddMaterials: (phaseId: string, moduleId: string) => void;
  onEditMaterial: (phaseId: string, moduleId: string, index: number) => void;
  onDeleteMaterial: (phaseId: string, moduleId: string, index: number) => void;
  onAddAssignment: (phaseId: string) => void;
  onEditAssignment: (phaseId: string, moduleId: string, index: number) => void;
  onDeleteAssignment: (phaseId: string, moduleId: string, index: number) => void;
}

export const MentorModuleCard = ({
  module,
  phaseId,
  isExpanded,
  onToggleExpand,
  onAddMaterials,
  onEditMaterial,
  onDeleteMaterial,
  onAddAssignment,
  onEditAssignment,
  onDeleteAssignment,
}: MentorModuleCardProps) => {
  return (
    <div className="rounded-2xl border border-[#E7EBF0] bg-white p-4">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <p className="text-xl font-semibold leading-tight text-[#1F2432]">{module.title}</p>
        <span className="text-[#6F7689]">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <MentorMaterialsList
            materials={module.materials}
            onAddClick={() => onAddMaterials(phaseId, module.id)}
            onEditClick={(index) => onEditMaterial(phaseId, module.id, index)}
            onDeleteClick={(index) => onDeleteMaterial(phaseId, module.id, index)}
          />

          <MentorAssignmentsList
            assignments={module.assignments}
            onAddClick={() => onAddAssignment(phaseId)}
            onEditClick={(index) => onEditAssignment(phaseId, module.id, index)}
            onDeleteClick={(index) => onDeleteAssignment(phaseId, module.id, index)}
          />
        </div>
      )}
    </div>
  );
};
