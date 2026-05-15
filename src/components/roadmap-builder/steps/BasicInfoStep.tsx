import { useEffect } from "react";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";
import RoadmapNotice from "../shared/RoadmapNotice";

/* ==========================================
   INLINE SPINNER
========================================== */

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-primary inline-block ml-1"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

/* ==========================================
   BASIC INFO STEP
========================================== */

export default function BasicInfoStep() {
  /* ---- store selectors ---- */
  const basicInfo = useRoadmapBuilderStore((s) => s.basicInfo);
  const setBasicInfo = useRoadmapBuilderStore((s) => s.setBasicInfo);
  const basicInfoErrors = useRoadmapBuilderStore((s) => s.basicInfoErrors);
  const clearBasicInfoError = useRoadmapBuilderStore(
    (s) => s.clearBasicInfoError
  );

  const domains = useRoadmapBuilderStore((s) => s.domains);
  const subDomains = useRoadmapBuilderStore((s) => s.subDomains);
  const experienceLevels = useRoadmapBuilderStore((s) => s.experienceLevels);

  const isLoadingDomains = useRoadmapBuilderStore(
    (s) => s.isLoadingDomains
  );
  const isLoadingSubDomains = useRoadmapBuilderStore(
    (s) => s.isLoadingSubDomains
  );
  const isLoadingExperienceLevels = useRoadmapBuilderStore(
    (s) => s.isLoadingExperienceLevels
  );

  const loadDomains = useRoadmapBuilderStore((s) => s.loadDomains);
  const loadSubDomains = useRoadmapBuilderStore((s) => s.loadSubDomains);
  const loadExperienceLevels = useRoadmapBuilderStore(
    (s) => s.loadExperienceLevels
  );

  const error = useRoadmapBuilderStore((s) => s.error);
  const dismissError = useRoadmapBuilderStore((s) => s.dismissError);

  /* ---- initial loads ---- */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (domains.length === 0) loadDomains(); }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (experienceLevels.length === 0) loadExperienceLevels(); }, []);

  /* ---- reload sub-domains whenever the selected domain changes ---- */
  useEffect(() => {
    if (basicInfo.skillDomainId != null) {
      loadSubDomains(basicInfo.skillDomainId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicInfo.skillDomainId]);

  /* ---- handlers ---- */
  const handleDomainChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value
      ? Number(e.target.value)
      : undefined;

    const name =
      domains.find((d) => d.id === id)?.name ?? "";

    setBasicInfo({
      skillDomainId: id,
      skillDomainName: name,
      /* reset sub-domain when domain changes */
      subDomainId: undefined,
      subDomainName: "",
    });
    clearBasicInfoError("skillDomainId");
    clearBasicInfoError("subDomainId");
  };

  const handleSubDomainChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value
      ? Number(e.target.value)
      : undefined;

    const name =
      subDomains.find((sd) => sd.id === id)?.name ?? "";

    setBasicInfo({ subDomainId: id, subDomainName: name });
    clearBasicInfoError("subDomainId");
  };

  const handleLevelFromChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value
      ? Number(e.target.value)
      : undefined;
    setBasicInfo({ targetLevelFrom: id });
    clearBasicInfoError("targetLevelFrom");
  };

  const handleLevelToChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = e.target.value
      ? Number(e.target.value)
      : undefined;
    setBasicInfo({ targetLevelTo: id });
    clearBasicInfoError("targetLevelTo");
  };

  /* ---- shared class strings ---- */
  const inputCls = `
    w-full h-14 rounded-2xl bg-[#F3F5F9]
    px-5 outline-none border border-transparent
    focus:border-primary transition
  `;

  const selectCls = `
    w-full h-12 rounded-2xl bg-[#F3F5F9]
    px-4 outline-none border border-transparent
    focus:border-primary transition
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const textareaCls = `
    w-full rounded-2xl bg-[#F3F5F9]
    p-5 outline-none border border-transparent
    focus:border-primary transition resize-none
  `;

  return (
    <div className="max-w-[920px] mx-auto space-y-4">
      {error ? (
        <RoadmapNotice
          message={error}
          splitMessageToList
          onDismiss={dismissError}
        />
      ) : null}

      {/* Card */}
      <div className="bg-white rounded-[28px] px-10 py-9">
        {/* Heading */}
        <div>
          <h1 className="text-[32px] leading-[40px] font-bold text-[#1F2432]">
            Create New Roadmap
          </h1>

          <p className="mt-2 text-[17px] text-[#7B869C]">
            Define the foundational structure of your mentorship
            journey.
          </p>
        </div>

        {/* Form */}
        <div className="mt-9 space-y-7">
          {/* Roadmap Title */}
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-[#4B5565] mb-3">
              ROADMAP TITLE
            </label>

            <input
              id="roadmap-title"
              type="text"
              placeholder="e.g. Full-Stack Web Development"
              value={basicInfo.title}
              onChange={(e) =>
                (setBasicInfo({ title: e.target.value }),
                clearBasicInfoError("title"))
              }
              className={inputCls}
            />
            {basicInfoErrors.title && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {basicInfoErrors.title}
              </p>
            )}
          </div>

          {/* Row: Domain / Sub-domain / Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Domain */}
            <div>
              <label className="block text-[15px] font-medium text-[#2A3042] mb-3">
                Domain
                {isLoadingDomains && <Spinner />}
              </label>

              <select
                id="roadmap-domain"
                value={basicInfo.skillDomainId != null ? String(basicInfo.skillDomainId) : ""}
                onChange={handleDomainChange}
                disabled={isLoadingDomains}
                className={selectCls}
              >
                <option value="">Select</option>
                {domains.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
              {basicInfoErrors.skillDomainId && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {basicInfoErrors.skillDomainId}
                </p>
              )}
            </div>

            {/* Sub-domain */}
            <div>
              <label className="block text-[15px] font-medium text-[#2A3042] mb-3">
                Sub Domain
                {isLoadingSubDomains && <Spinner />}
              </label>

              <select
                id="roadmap-subdomain"
                value={basicInfo.subDomainId != null ? String(basicInfo.subDomainId) : ""}
                onChange={handleSubDomainChange}
                disabled={
                  isLoadingSubDomains ||
                  basicInfo.skillDomainId == null
                }
                className={selectCls}
              >
                <option value="">Select</option>
                {subDomains.map((sd) => (
                  <option key={sd.id} value={String(sd.id)}>
                    {sd.name}
                  </option>
                ))}
              </select>
              {basicInfoErrors.subDomainId && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {basicInfoErrors.subDomainId}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[15px] font-medium text-[#2A3042] mb-3">
                Duration (weeks)
              </label>

              <input
                id="roadmap-duration"
                type="number"
                min={1}
                placeholder="e.g. 12"
                value={basicInfo.duration ?? ""}
                onChange={(e) =>
                  (setBasicInfo({
                    duration: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }),
                  clearBasicInfoError("duration"))
                }
                className={inputCls.replace("h-14", "h-12")}
              />
              {basicInfoErrors.duration && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {basicInfoErrors.duration}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-[#4B5565] mb-3">
              DESCRIPTION
            </label>

            <textarea
              id="roadmap-description"
              rows={5}
              placeholder="Describe what learners will gain from this roadmap…"
              value={basicInfo.description}
              onChange={(e) =>
                (setBasicInfo({ description: e.target.value }),
                clearBasicInfoError("description"))
              }
              className={textareaCls}
            />
            {basicInfoErrors.description && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {basicInfoErrors.description}
              </p>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-[#4B5565] mb-5">
              TARGET AUDIENCE (OPTIONAL)
              {isLoadingExperienceLevels && <Spinner />}
            </label>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[15px] font-medium text-[#4B5565]">
                FROM
              </span>

              <select
                id="roadmap-level-from"
                value={basicInfo.targetLevelFrom != null ? String(basicInfo.targetLevelFrom) : ""}
                onChange={handleLevelFromChange}
                disabled={isLoadingExperienceLevels}
                className={`w-[210px] h-12 rounded-2xl bg-[#F3F5F9] px-4 outline-none border border-transparent focus:border-primary transition disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select</option>
                {experienceLevels.map((lvl) => (
                  <option key={lvl.id} value={String(lvl.id)}>
                    {lvl.name}
                  </option>
                ))}
              </select>
              {basicInfoErrors.targetLevelFrom && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {basicInfoErrors.targetLevelFrom}
                </p>
              )}

              <span className="text-[15px] font-medium text-[#4B5565]">
                TO
              </span>

              <select
                id="roadmap-level-to"
                value={basicInfo.targetLevelTo != null ? String(basicInfo.targetLevelTo) : ""}
                onChange={handleLevelToChange}
                disabled={isLoadingExperienceLevels}
                className={`w-[210px] h-12 rounded-2xl bg-[#F3F5F9] px-4 outline-none border border-transparent focus:border-primary transition disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select</option>
                {experienceLevels.map((lvl) => (
                  <option key={lvl.id} value={String(lvl.id)}>
                    {lvl.name}
                  </option>
                ))}
              </select>
              {basicInfoErrors.targetLevelTo && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {basicInfoErrors.targetLevelTo}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}