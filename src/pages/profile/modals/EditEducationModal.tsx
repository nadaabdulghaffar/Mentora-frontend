import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Trash2, X } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import type { EducationEntry } from '../types';

interface EditEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  education: EducationEntry[];
  onSave: (entries: EducationEntry[]) => void;
}

const emptyEntry = (): EducationEntry => ({
  id: `edu-${Date.now()}`,
  degree: '',
  faculty: '',
  institution: '',
  startYear: '',
  endYear: '',
});

export function EditEducationModal({ isOpen, onClose, education, onSave }: EditEducationModalProps) {
  const [entries, setEntries] = useState<EducationEntry[]>(() => [...education]);

  useEffect(() => {
    if (isOpen) {
      setEntries(education.length ? [...education] : [emptyEntry()]);
    }
  }, [isOpen, education]);

  const handleSave = () => {
    onSave(entries.filter((e) => e.degree.trim() || e.institution.trim()));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-xl p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#ECEFF5] px-6 py-4">
        <h2 className="text-lg font-bold text-[#1F2533]">Edit Education</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#8B92A8] hover:bg-[#F4F5FA]" aria-label="Close">
          <X size={22} />
        </button>
      </div>

      <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
        <div className="flex items-center gap-2 text-primary">
          <GraduationCap size={22} />
          <span className="text-xs font-bold uppercase tracking-wider">Education</span>
        </div>

        {entries.map((entry, index) => (
          <div key={entry.id} className="relative rounded-2xl border border-[#E8EBF2] p-4">
            <button
              type="button"
              className="absolute right-3 top-3 text-[#9CA3B8] hover:text-red-500"
              onClick={() => setEntries((prev) => prev.filter((_, i) => i !== index))}
              aria-label="Remove entry"
            >
              <Trash2 size={18} />
            </button>
            <label className="mb-1.5 mt-2 block text-xs font-semibold text-[#6B7289]">Degree / Field of Study</label>
            <input
              value={entry.degree}
              onChange={(e) =>
                setEntries((prev) =>
                  prev.map((row, i) => (i === index ? { ...row, degree: e.target.value } : row))
                )
              }
              placeholder="e.g. Master of Science in Interaction Design"
              className="mb-3 w-full rounded-xl border border-[#D8DCE8] px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6B7289]">Faculty</label>
                <input
                  value={entry.faculty ?? ''}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, faculty: e.target.value } : row))
                    )
                  }
                  placeholder="e.g. Faculty of Applied Arts"
                  className="w-full rounded-xl border border-[#D8DCE8] px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6B7289]">Institution</label>
                <input
                  value={entry.institution}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, institution: e.target.value } : row))
                    )
                  }
                  className="w-full rounded-xl border border-[#D8DCE8] px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6B7289]">Start Year</label>
                <input
                  value={entry.startYear}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, startYear: e.target.value } : row))
                    )
                  }
                  placeholder="2018"
                  className="w-full rounded-xl border border-[#D8DCE8] px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6B7289]">End Year</label>
                <input
                  value={entry.endYear}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((row, i) => (i === index ? { ...row, endYear: e.target.value } : row))
                    )
                  }
                  placeholder="2020"
                  className="w-full rounded-xl border border-[#D8DCE8] px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setEntries((prev) => [...prev, emptyEntry()])}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#C5CAD8] py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
        >
          <Plus size={18} />
          Add More Education
        </button>
      </div>

      <div className="flex justify-end gap-3 border-t border-[#ECEFF5] px-6 py-4">
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-[#5C6378] hover:bg-[#F4F5FA]">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
