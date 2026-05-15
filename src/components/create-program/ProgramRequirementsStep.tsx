import { useEffect, useState } from "react";
import { getIn, useFormikContext } from "formik";

import lookupAPI from "../../services/lookupService";
import type { CreateProgramFormData } from "./types";

const EXPERIENCE_OPTIONS = [
  { value: 1, label: "None" },
  { value: 2, label: "Beginner" },
  { value: 3, label: "Intermediate" },
  { value: 4, label: "Advanced" },
] as const;

const DEFAULT_EXPERIENCE_FOR_NEW_TECH = 2;
const hintStyle = "mt-1 text-xs text-[#64748B] leading-snug";

type TechOption = {
  id: number;
  name: string;
};

export default function ProgramRequirementsStep() {
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

  const labelStyle = "block text-sm font-medium text-slateInk mb-2";
  const inputStyle = "w-full h-12 rounded-xl border border-[#D8DBE4] bg-white px-4 text-sm text-slateInk outline-none focus:border-primary";
  const errorStyle = "mt-1 text-xs text-red-500";
  const inlineSelectClass = "h-9 min-w-[7.5rem] shrink-0 rounded-lg border border-[#D8DBE4] bg-white px-2 text-xs sm:text-sm text-slateInk outline-none focus:border-primary";

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
            Matches your mentees' academic year (university track). Stored as <span className="font-medium">EducationStatus</span> on the server.
          </p>
          {getIn(errors, "educationLevel") && <p className={errorStyle}>{String(getIn(errors, "educationLevel"))}</p>}
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
            Lowest experience band you expect from applicants. Stored as <span className="font-medium">CurrentLevel</span>.
          </p>
          {getIn(errors, "targetLevel") && <p className={errorStyle}>{String(getIn(errors, "targetLevel"))}</p>}
        </div>
      </div>

      <div>
        <label className={labelStyle}>Technologies &amp; required experience</label>
        <p className={`${hintStyle} mb-2`}>
          Options come from your selected sub-domain. Check a technology, then set the minimum <span className="font-medium">ExperienceLevel</span> you require. Publishing needs at least one complete row.
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

                const toggle = () => {
                  if (checked) {
                    setFieldValue(
                      "technologies",
                      list.filter((item) => item.technologyId !== tech.id)
                    );
                    return;
                  }

                  setFieldValue("technologies", [
                    ...list,
                    { technologyId: tech.id, requiredExperienceLevel: DEFAULT_EXPERIENCE_FOR_NEW_TECH },
                  ]);
                };

                const updateExperience = (level: number) => {
                  const parsed = Number(level);
                  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 4) return;
                  setFieldValue(
                    "technologies",
                    list.map((item) =>
                      item.technologyId === tech.id ? { ...item, requiredExperienceLevel: parsed } : item
                    )
                  );
                };

                return (
                  <li key={tech.id}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:py-1.5 hover:bg-[#FAFAFE]/80">
                      <label className="flex flex-1 min-w-0 items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={toggle}
                          className="h-4 w-4 shrink-0 rounded border-[#D8DBE4] text-primary focus:ring-primary/30"
                        />
                        <span className="text-sm font-medium text-slateInk truncate">{tech.name}</span>
                      </label>

                      {checked && row && (
                        <select
                          className={inlineSelectClass}
                          value={row.requiredExperienceLevel}
                          onChange={(e) => updateExperience(Number(e.target.value))}
                          aria-label={`Required experience for ${tech.name}`}
                        >
                          {EXPERIENCE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {techFieldErrors?.requiredExperienceLevel && (
                      <p className={`${errorStyle} px-3 pb-2 -mt-1`}>{String(techFieldErrors.requiredExperienceLevel)}</p>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-sm text-[#64748B]">Select a sub-domain in step 1 to load technologies for this program.</li>
            )}
          </ul>
        </div>

        {getIn(errors, "technologies")?.message && <p className={errorStyle}>{String(getIn(errors, "technologies").message)}</p>}
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
          {getIn(errors, "capacity") && <p className={errorStyle}>{String(getIn(errors, "capacity"))}</p>}
        </div>

        <div>
          <label className={labelStyle}>Application deadline</label>
          <input
            type="date"
            value={values.deadline ?? ""}
            onChange={(e) => setFieldValue("deadline", e.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Program duration</label>
          <select
            value={values.duration}
            onChange={(e) => setFieldValue("duration", e.target.value)}
            className={inputStyle}
          >
            <option value="">Select duration</option>
            <option value="2 Weeks">2 Weeks</option>
            <option value="1 Month">1 Month</option>
            <option value="2 Months">2 Months</option>
            <option value="3 Months">3 Months</option>
            <option value="6 Months">6 Months</option>
          </select>
          <p className={hintStyle}>Required when you <span className="font-medium">publish</span>; optional for drafts.</p>
          {getIn(errors, "duration") && <p className={errorStyle}>{String(getIn(errors, "duration"))}</p>}
        </div>

        <div>
          <label className={labelStyle}>Your availability</label>
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
          <p className={hintStyle}>Required when you <span className="font-medium">publish</span>; optional for drafts.</p>
          {getIn(errors, "availability") && <p className={errorStyle}>{String(getIn(errors, "availability"))}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-[#F8F9FC] px-4 py-3 text-sm text-[#64748B]">
        Application deadline is stored on this device only until the backend supports it on create.
      </div>
    </div>
  );
}
