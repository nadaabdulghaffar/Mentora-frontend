import { Pencil, Trash2, Plus } from 'lucide-react';
import { IconButton } from '../common/IconButton';

type RoadmapMaterial = {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'template';
  duration: string;
};

interface MentorMaterialsListProps {
  materials: string[];
  onAddClick: () => void;
  onEditClick: (index: number) => void;
  onDeleteClick: (index: number) => void;
  showAddButton?: boolean;
}

export const MentorMaterialsList = ({
  materials,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: MentorMaterialsListProps) => {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6F7689]">Materials</p>
        <button
          type="button"
          onClick={onAddClick}
          className="text-[#49B1A2]"
          aria-label="Add materials"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {materials.map((material, index) => (
          <div key={material} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FC] px-3 py-2 text-base text-[#2E3649]">
            <p className="min-w-0 truncate">{material}</p>
            <div className="flex items-center gap-1">
              <IconButton
                icon={<Pencil size={14} />}
                onClick={() => onEditClick(index)}
                variant="edit"
                ariaLabel="Edit material"
              />
              <IconButton
                icon={<Trash2 size={14} />}
                onClick={() => onDeleteClick(index)}
                variant="delete"
                ariaLabel="Delete material"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MenteeMaterialsListProps {
  materials: RoadmapMaterial[];
  checkedIds: string[];
  onToggleCheck: (materialId: string) => void;
  badgeBg: string;
  badgeText: string;
}

export const MenteeMaterialsList = ({
  materials,
  checkedIds,
  onToggleCheck,
  badgeBg,
  badgeText,
}: MenteeMaterialsListProps) => {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5E48C3]">Materials</p>
      <div className="space-y-3">
        {materials.map((material) => (
          <div 
            key={material.id} 
            className="flex items-start gap-3 rounded-2xl border border-[#E5E8F0] bg-[#F7F8FC] px-3 py-3 shadow-sm"
          >
            <button
              type="button"
              onClick={() => onToggleCheck(material.id)}
              aria-pressed={checkedIds.includes(material.id)}
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition ${
                checkedIds.includes(material.id)
                  ? 'border-[#6E56CF] bg-[#EEE8FF] text-[#6E56CF]'
                  : 'border-[#C9D4EA] text-[#8B95A8]'
              }`}
            >
              {checkedIds.includes(material.id) && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 3.5L5.25 10L2.5 7.25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight text-[#202738]">{material.title}</p>
            </div>
            <span className={`rounded-full ${badgeBg} px-2.5 py-1 text-[11px] font-semibold flex-shrink-0`}>
              <p className="mt-0.5 text-xs text-[#6E7589]">{material.type}</p>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
