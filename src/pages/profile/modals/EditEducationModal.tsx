import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Plus, Trash2, X } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { getApiErrorMessage } from '../../../utils/apiErrorMessage';
import type { EducationEntry } from '../types';
import {
  buildYearOptions,
  EDUCATION_YEAR_MIN,
  getEducationYearBounds,
  validateEducationEntries,
  type EducationFieldErrors,
} from '../educationValidation';

interface EditEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  education: EducationEntry[];
  onSave: (entries: EducationEntry[]) => void | Promise<void>;
}

const emptyEntry = (): EducationEntry => ({
  id: `edu-${Date.now()}`,
  degree: '',
  faculty: '',
  institution: '',
  startYear: '',
  endYear: '',
});

function fieldErrorClass(hasError: boolean): string {
  return hasError ? 'border-red-400 focus:border-red-500' : 'border-[#D8DCE8] focus:border-primary';
}

export function EditEducationModal({ isOpen, onClose, education, onSave }: EditEducationModalProps) {
  const [entries, setEntries] = useState<EducationEntry[]>(() => [...education]);
  const [fieldErrorsById, setFieldErrorsById] = useState<Record<string, EducationFieldErrors>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const { startYearMax, graduationYearMax } = useMemo(() => getEducationYearBounds(), []);

  useEffect(() => {
    if (isOpen) {
      setEntries(education.length ? [...education] : [emptyEntry()]);
      setFieldErrorsById({});
      setFormError('');
      setSaving(false);
    }
  }, [isOpen, education]);

  const updateEntry = (index: number, patch: Partial<EducationEntry>) => {
    setEntries((prev) =>
      prev.map((row, i) => {
        if (i !== index) {
          return row;
        }

        const next = { ...row, ...patch };

        if (patch.startYear !== undefined && next.endYear.trim()) {
          const start = Number(patch.startYear);
          const end = Number(next.endYear);
          if (Number.isFinite(start) && Number.isFinite(end) && start > end) {
            next.endYear = '';
          }
        }

        return next;
      })
    );

    const entryId = entries[index]?.id;
    if (entryId) {
      setFieldErrorsById((prev) => {
        if (!prev[entryId]) {
          return prev;
        }
        const next = { ...prev };
        delete next[entryId];
        return next;
      });
    }
    setFormError('');
  };

  const getStartYearOptions = (graduationYear: string) => {
    const max =
      graduationYear.trim() && Number.isFinite(Number(graduationYear))
        ? Math.min(startYearMax, Number(graduationYear))
        : startYearMax;
    return buildYearOptions(EDUCATION_YEAR_MIN, max);
  };

  const getGraduationYearOptions = (startYear: string) => {
    const min =
      startYear.trim() && Number.isFinite(Number(startYear))
        ? Math.max(EDUCATION_YEAR_MIN, Number(startYear))
        : EDUCATION_YEAR_MIN;
    return buildYearOptions(min, graduationYearMax);
  };

  const handleSave = async () => {
    const validation = validateEducationEntries(entries);
    if (!validation.valid) {
      setFieldErrorsById(validation.errorsById);
      setFormError(validation.formError ?? 'Please fix the highlighted fields before saving.');
      return;
    }

    const payload = entries.filter((entry) => entry.degree.trim() || entry.institution.trim());

    setSaving(true);
    setFormError('');
    try {
      await onSave(payload);
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Failed to save education. Please try again.'));
    } finally {
      setSaving(false);
    }
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

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        {entries.map((entry, index) => {
          const fieldErrors = fieldErrorsById[entry.id] ?? {};

          return (
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
                onChange={(e) => updateEntry(index, { degree: e.target.value })}
                placeholder="e.g. Master of Science in Interaction Design"
                className={`mb-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ${fieldErrorClass(Boolean(fieldErrors.degree))}`}
              />
              {fieldErrors.degree ? <p className="mb-2 text-xs text-red-600">{fieldErrors.degree}</p> : <div className="mb-3" />}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6B7289]">Faculty</label>
                  <input
                    value={entry.faculty ?? ''}
                    onChange={(e) => updateEntry(index, { faculty: e.target.value })}
                    placeholder="e.g. Faculty of Applied Arts"
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${fieldErrorClass(Boolean(fieldErrors.faculty))}`}
                  />
                  {fieldErrors.faculty ? <p className="mt-1 text-xs text-red-600">{fieldErrors.faculty}</p> : null}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6B7289]">Institution</label>
                  <input
                    value={entry.institution}
                    onChange={(e) => updateEntry(index, { institution: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${fieldErrorClass(Boolean(fieldErrors.institution))}`}
                  />
                  {fieldErrors.institution ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.institution}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6B7289]">Start Year</label>
                  <select
                    id={`education-start-${entry.id}`}
                    value={entry.startYear}
                    onChange={(e) => updateEntry(index, { startYear: e.target.value })}
                    className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none ${fieldErrorClass(Boolean(fieldErrors.startYear))}`}
                  >
                    {getStartYearOptions(entry.endYear).map((option) => (
                      <option key={`start-${entry.id}-${option.value || 'empty'}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.startYear ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.startYear}</p>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6B7289]">Graduation Year</label>
                  <select
                    id={`education-end-${entry.id}`}
                    value={entry.endYear}
                    onChange={(e) => updateEntry(index, { endYear: e.target.value })}
                    className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none ${fieldErrorClass(Boolean(fieldErrors.endYear))}`}
                  >
                    {getGraduationYearOptions(entry.startYear).map((option) => (
                      <option key={`end-${entry.id}-${option.value || 'empty'}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.endYear ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.endYear}</p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

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
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-[#5C6378] hover:bg-[#F4F5FA] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}
