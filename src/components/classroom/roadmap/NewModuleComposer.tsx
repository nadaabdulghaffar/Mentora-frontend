import { Paperclip, Check, Plus, Trash2 } from 'lucide-react';

type NewModuleComposerDraft = {
  title: string;
  summary: string;
  materials: string[];
  tasks: string[];
};

interface NewModuleComposerProps {
  isOpen: boolean;
  phaseTitle: string;
  phaseId: string;
  draft: NewModuleComposerDraft;
  onToggleOpen: () => void;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onMaterialChange: (index: number, value: string) => void;
  onTaskChange: (index: number, value: string) => void;
  onRemoveMaterial: (index: number) => void;
  onRemoveTask: (index: number) => void;
  onAddMaterial: () => void;
  onAddTask: () => void;
}

export const NewModuleComposer = ({
  isOpen,
  phaseTitle,
  draft,
  onToggleOpen,
  onTitleChange,
  onSummaryChange,
  onMaterialChange,
  onTaskChange,
  onRemoveMaterial,
  onRemoveTask,
  onAddMaterial,
  onAddTask,
}: NewModuleComposerProps) => {
  const displayTitle = phaseTitle.split(':')[0];

  return (
    <div
      className={`w-full rounded-2xl border border-dashed bg-white px-4 py-3 transition ${
        isOpen ? 'border-[#6744C9]' : 'border-[#D8DEEA]'
      }`}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-full text-center text-sm font-semibold text-[#5D6579]"
      >
        Add New Module to {displayTitle}
      </button>

      {isOpen && (
        <div className="mt-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E7589]">Topic Title</p>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Add a title"
              className="h-12 w-full rounded-2xl border border-transparent bg-[#F1F3F7] px-4 text-base text-[#2B3243] outline-none placeholder:text-[#93A0B7]"
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E7589]">Summary</p>
            <textarea
              value={draft.summary}
              onChange={(event) => onSummaryChange(event.target.value)}
              placeholder="Add a summary"
              className="min-h-[98px] w-full rounded-2xl border border-transparent bg-[#F1F3F7] px-4 py-3 text-base text-[#2B3243] outline-none placeholder:text-[#93A0B7]"
            />
          </div>

          <div className="mt-5 grid gap-6 border-t border-[#ECEEF5] pt-4 md:grid-cols-2">
            {/* Materials Section */}
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#6E7589]">
                <Paperclip size={16} className="text-[#6E7589]" />
                Materials
              </p>
              <div className="mt-3 space-y-2">
                {draft.materials.map((material, index) => (
                  <div key={`new-module-material-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={material}
                      onChange={(event) => onMaterialChange(index, event.target.value)}
                      placeholder="Material title"
                      className="h-10 w-full rounded-xl border border-[#E3E7F1] bg-white px-3 text-sm text-[#2B3243] outline-none placeholder:text-[#9AA3B6]"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveMaterial(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#B33A3A] hover:bg-[#FFE9E9]"
                      aria-label="Delete material draft"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onAddMaterial}
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#5B45BE]"
              >
                <Plus size={14} />
                Add Material
              </button>
            </div>

            {/* Tasks Section */}
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#6E7589]">
                <Check size={16} className="text-[#6E7589]" />
                Tasks
              </p>
              <div className="mt-3 space-y-2">
                {draft.tasks.map((task, index) => (
                  <div key={`new-module-task-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(event) => onTaskChange(index, event.target.value)}
                      placeholder="Task title"
                      className="h-10 w-full rounded-xl border border-[#E3E7F1] bg-white px-3 text-sm text-[#2B3243] outline-none placeholder:text-[#9AA3B6]"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveTask(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#B33A3A] hover:bg-[#FFE9E9]"
                      aria-label="Delete task draft"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onAddTask}
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#5B45BE]"
              >
                <Plus size={14} />
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
