import { useEffect, useState, useCallback } from "react";
import { getIn, useFormikContext } from "formik";

import lookupAPI from "../../services/lookupService";
import type { CreateProgramFormData } from "./types";

const DEFAULT_EXPERIENCE_FOR_NEW_TECH = 2;
const hintStyle = "mt-1 text-xs text-[#64748B] leading-snug";
const errorStyle = "mt-1 text-xs text-red-500";

type TechOption = {
  id: number;
  name: string;
};

type Props = {
  showValidationErrors?: boolean;
};

export default function ProgramRequirementsStep({ showValidationErrors = false }: Props) {
  const { values, setFieldValue, errors } = useFormikContext<CreateProgramFormData>();
  const subDomainId = values.subDomainId;

  const [techOptions, setTechOptions] = useState<TechOption[]>([]);
  const [techLoading, setTechLoading] = useState(false);
  const [techLoadError, setTechLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!subDomainId || subDomainId < 1) {
      setTechOptions([]);
      setTechLoadError(null);
      setTechLoading(false);
      setFieldValue("technologies", []);
      return;
    }

    let cancelled = false;

    const loadTechnologies = async () => {
      setTechLoading(true);
      setTechLoadError(null);
      setTechOptions([]);

      try {
        const res = await lookupAPI.getTechnologies(String(subDomainId));
        if (cancelled) return;

        const list: TechOption[] =
          res.success && res.data
            ? res.data.map((tech) => ({
                id: Number(tech.id),
                name: tech.name ?? `Technology ${tech.id}`,
              }))
            : [];

        setTechOptions(list);

        const allowed = new Set(list.map((tech) => tech.id));
        const current = values.technologies ?? [];
        const filtered = current.filter((row) => allowed.has(row.technologyId));

        if (filtered.length !== current.length) {
          setFieldValue("technologies", filtered);
        }
      } catch {
        if (!cancelled) {
          setTechLoadError("Could not load technologies. Try again or check your connection.");
          setTechOptions([]);
        }
      } finally {
        if (!cancelled) {
          setTechLoading(false);
        }
      }
    };

    void loadTechnologies();

    return () => {
      cancelled = true;
    };
  }, [subDomainId, setFieldValue, values.technologies]);

  const handleToggleTech = useCallback((techId: number, isChecked: boolean) => {
    const list = values.technologies ?? [];
    if (isChecked) {
      setFieldValue(
        "technologies",
        list.filter((item) => item.technologyId !== techId)
      );
    } else {
      setFieldValue("technologies", [
        ...list,
        { technologyId: techId, requiredExperienceLevel: DEFAULT_EXPERIENCE_FOR_NEW_TECH },
      ]);
    }
  }, [values.technologies, setFieldValue]);

  const handleUpdateExperience = useCallback((techId: number, level: number) => {
    const list = values.technologies ?? [];
    const parsed = Number(level);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 4) return;
    setFieldValue(
      "technologies",
      list.map((item) =>
        item.technologyId === techId ? { ...item, requiredExperienceLevel: parsed } : item
      )
    );
  }, [values.technologies, setFieldValue]);

  const labelStyle = "block text-sm font-medium text-slateInk mb-2";
  const inputStyle = "w-full h-12 rounded-xl border border-[#D8DBE4] bg-white px-4 text-sm text-slateInk outline-none focus:border-primary";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Mentee education stage</label>
          <select
            value={values.educationLevel}
            onChange={(e) => setFieldValue("educationLevel", Number(e.target.value))}
            className={inputStyle}
          >
            <option value="">Select stage</option>
            <option value={1}>Freshman (year 1)</option>
            <option value={2}>Sophomore (year 2)</option>
            <option value={3}>Junior (year 3)</option>
            <option value={4}>Senior (year 4)</option>
            <option value={5}>Graduate</option>
          </select>
          <p className={hintStyle}>
          </p>
          {showValidationErrors && getIn(errors, "educationLevel") && <p className={errorStyle}>{String(getIn(errors, "educationLevel"))}</p>}
        </div>

        <div>
          <label className={labelStyle}>Minimum applicant skill level</label>
          <select
            value={values.targetLevel}
            onChange={(e) => setFieldValue("targetLevel", Number(e.target.value))}
            className={inputStyle}
          >
            <option value="">Select level</option>
            <option value={1}>Beginner</option>
            <option value={2}>Junior</option>
            <option value={3}>Mid-level</option>
            <option value={4}>Senior</option>
          </select>
          <p className={hintStyle}>
          </p>
          {showValidationErrors && getIn(errors, "targetLevel") && <p className={errorStyle}>{String(getIn(errors, "targetLevel"))}</p>}
        </div>
      </div>

      <div>
        <label className={labelStyle}>Technologies &amp; required experience</label>
        <p className={`${hintStyle} mb-2`}>
        </p>

        {techLoading && <p className="text-xs text-[#64748B] mb-2">Loading technologies…</p>}
        {techLoadError && <p className={`${errorStyle} mb-2`} role="alert">{techLoadError}</p>}

        {!techLoading && !techLoadError && subDomainId > 0 && techOptions.length === 0 && (
          <p className="text-xs text-[#64748B] mb-2 rounded-lg border border-dashed border-[#D8DBE4] px-3 py-2 bg-[#FAFAFE]">
            No technologies are listed for this sub-domain yet. You can still save a draft; to publish later, choose a sub-domain with catalog entries or ask an admin to add technologies.
          </p>
        )}

        <div className="rounded-xl border border-[#E6E8F0] overflow-hidden bg-white">
          <ul className="divide-y divide-[#EEF0F5] max-h-[min(240px,50vh)] overflow-y-auto">
            {subDomainId > 0 ? (
              techOptions.map((tech) => {
                const list = values.technologies ?? [];
                const checked = list.some((item) => item.technologyId === tech.id);
                const row = list.find((item) => item.technologyId === tech.id);
                const rowIndex = list.findIndex((item) => item.technologyId === tech.id);
                const techFieldErrors = rowIndex >= 0 && Array.isArray(getIn(errors, "technologies")) ? getIn(errors, `technologies.${rowIndex}`) : undefined;

                return (
                  <li key={tech.id} className="group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#F8F9FC]">
                    <div className="flex h-6 items-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleTech(tech.id, checked)}
                        className="h-4 w-4 rounded border-[#C4CAD7] text-primary focus:ring-primary focus:ring-offset-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-semibold text-[#1F2432] cursor-pointer" onClick={() => handleToggleTech(tech.id, checked)}>
                        {tech.name}
                      </label>
                      {checked && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <select
                            value={row?.requiredExperienceLevel ?? 2}
                            onChange={(e) => handleUpdateExperience(tech.id, Number(e.target.value))}
                            className="h-9 w-full max-w-[200px] rounded-lg border border-[#D8DBE4] bg-white px-3 text-sm text-[#47516B] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                          >
                            <option value={1}>Beginner</option>
                            <option value={2}>Intermediate</option>
                            <option value={3}>Advanced</option>
                            <option value={4}>Expert</option>
                          </select>
                          {showValidationErrors && techFieldErrors?.requiredExperienceLevel && (
                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md">
                              {String(techFieldErrors.requiredExperienceLevel)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-sm text-[#64748B]">Select a sub-domain in step 1 to load technologies for this program.</li>
            )}
          </ul>
        </div>

        {showValidationErrors && (() => {
          const tErrors = getIn(errors, "technologies");
          const msg = typeof tErrors === "string" ? tErrors : tErrors?.message;
          return msg ? <p className={errorStyle}>{String(msg)}</p> : null;
        })()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Capacity</label>
          <input
            type="number"
            min="1"
            value={values.capacity}
            onChange={(e) => setFieldValue("capacity", Number(e.target.value))}
            placeholder="5"
            className={inputStyle}
          />
          {showValidationErrors && getIn(errors, "capacity") && <p className={errorStyle}>{String(getIn(errors, "capacity"))}</p>}
        </div>

       <div>
  <label className={labelStyle}>
Application deadline
  </label>

  <input
    type="date"
    value={values.deadline ?? ""}
    onChange={(e) =>
      setFieldValue("deadline", e.target.value)
    }
    className={inputStyle}
  />

  {showValidationErrors && getIn(errors, "deadline") && (
    <p className={errorStyle}>
      {String(getIn(errors, "deadline"))}
    </p>
  )}
</div>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className={labelStyle}>Program duration</label>
            <span className="rounded-full bg-[#F1F3F8] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
              Optional
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFieldValue("duration", Math.max(1, (Number(values.duration) || 1) - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D8DBE4] bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              -
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                min="1"
                value={values.duration || ""}
                onChange={(e) => setFieldValue("duration", e.target.value ? Number(e.target.value) : "")}
                className={`${inputStyle} pr-20 text-center`}
                placeholder="1"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <span className="text-sm font-medium text-gray-500">
                  {Number(values.duration) === 1 ? "Month" : "Months"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFieldValue("duration", (Number(values.duration) || 0) + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D8DBE4] bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              +
            </button>
          </div>
          {showValidationErrors && getIn(errors, "duration") && <p className={errorStyle}>{String(getIn(errors, "duration"))}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className={labelStyle}>Your availability</label>
            <span className="rounded-full bg-[#F1F3F8] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
              Optional
            </span>
          </div>
          <select
            value={values.availability}
            onChange={(e) => setFieldValue("availability", e.target.value)}
            className={inputStyle}
          >
            <option value="">Select availability</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Flexible">Flexible</option>
          </select>
          {showValidationErrors && getIn(errors, "availability") && <p className={errorStyle}>{String(getIn(errors, "availability"))}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-[#F8F9FC] px-4 py-3 text-sm text-[#64748B]">
      </div>
    </div>
  );
}
