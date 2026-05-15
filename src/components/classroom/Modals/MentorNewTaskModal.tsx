import React from 'react';
import { X, Plus, Calendar } from 'lucide-react';

export type MentorNewTaskResourceRow = {
  id: string;
  title: string;
  url: string;
};

type MentorNewTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  deadline: string;
  onDeadlineChange: (value: string) => void;
  resources: MentorNewTaskResourceRow[];
  onResourcesChange: (next: MentorNewTaskResourceRow[]) => void;
  onPublish: () => void;
};

const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A91A5]';
const inputClass =
  'w-full rounded-xl border border-[#E6E9F2] bg-[#F4F6FA] px-4 py-3 text-sm text-[#1F2432] outline-none transition placeholder:text-[#9AA1B1] focus:border-[#5E4BC5] focus:bg-white';

export default function MentorNewTaskModal({
  isOpen,
  onClose,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  deadline,
  onDeadlineChange,
  resources,
  onResourcesChange,
  onPublish,
}: MentorNewTaskModalProps) {
  if (!isOpen) return null;

  const addResource = () => {
    onResourcesChange([
      ...resources,
      { id: `resource-${Date.now()}`, title: '', url: '' },
    ]);
  };

  const updateResource = (id: string, patch: Partial<MentorNewTaskResourceRow>) => {
    onResourcesChange(resources.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeResource = (id: string) => {
    if (resources.length <= 1) {
      onResourcesChange([{ id: `resource-${Date.now()}`, title: '', url: '' }]);
      return;
    }
    onResourcesChange(resources.filter((r) => r.id !== id));
  };

  const canPublish = title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-labelledby="mentor-new-task-title"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#ECEFF6] px-6 py-5">
          <h2 id="mentor-new-task-title" className="text-xl font-bold text-[#1F2432]">
            New Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6F7689] transition hover:bg-[#F2F4F8]"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="max-h-[min(70vh,540px)] space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="mentor-new-task-title-input" className={labelClass}>
              Title
            </label>
            <input
              id="mentor-new-task-title-input"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Heuristic Review"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="mentor-new-task-desc" className={labelClass}>
              Description
            </label>
            <textarea
              id="mentor-new-task-desc"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Provide assignment details..."
              rows={4}
              className={`${inputClass} min-h-[120px] resize-y`}
            />
          </div>

          <div>
            <label htmlFor="mentor-new-task-deadline" className={labelClass}>
              Deadline
            </label>
            <div className="relative">
              <input
                id="mentor-new-task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => onDeadlineChange(e.target.value)}
                className={`${inputClass} pr-11 [color-scheme:light]`}
              />
              <Calendar
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A91A5]"
                aria-hidden
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#E6E9F2] bg-[#FCFCFE] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className={labelClass}>Task resources</span>
              <button
                type="button"
                onClick={addResource}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE2EF] bg-white text-[#5E4BC5] transition hover:bg-[#F4F0FF]"
                aria-label="Add resource"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {resources.map((row, index) => (
                <div key={row.id} className="space-y-3 rounded-lg border border-[#ECEFF6] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F7689]">Resource {index + 1}</span>
                    {resources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResource(row.id)}
                        className="text-xs font-medium text-[#AF2F4D] hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`res-title-${row.id}`}>
                      Title
                    </label>
                    <input
                      id={`res-title-${row.id}`}
                      type="text"
                      value={row.title}
                      onChange={(e) => updateResource(row.id, { title: e.target.value })}
                      placeholder="e.g. Design Thinking Handbook"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`res-link-${row.id}`}>
                      Link
                    </label>
                    <input
                      id={`res-link-${row.id}`}
                      type="url"
                      value={row.url}
                      onChange={(e) => updateResource(row.id, { url: e.target.value })}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#ECEFF6] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F4F6FA]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canPublish}
            onClick={onPublish}
            className="rounded-xl bg-[#5E4BC5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4F3DB0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Publish Task
          </button>
        </div>
      </div>
    </div>
  );
}
