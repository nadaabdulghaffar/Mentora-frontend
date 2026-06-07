import { useNavigate, useLocation } from "react-router-dom";

import { useRoadmapOptionsForSubdomain } from "./useRoadmapOptionsForSubdomain";

const PENDING_CREATE_PROGRAM_DRAFT_KEY = "mentora:create-program-draft";

type RoadmapSelectionFieldProps = {
  subDomainId: number;
  value: number | null;
  onChange: (roadmapId: number | null) => void;
  allowEmpty?: boolean;
  emptyOptionLabel?: string;
  showCreateLink?: boolean;
  onCreateNewRoadmap?: () => void;
  className?: string;
};

export default function RoadmapSelectionField({
  subDomainId,
  value,
  onChange,
  allowEmpty = true,
  emptyOptionLabel = "No Roadmap",
  showCreateLink = false,
  onCreateNewRoadmap,
  className = "w-full h-12 rounded-xl border border-[#D8DBE4] px-4 text-sm outline-none focus:border-primary",
}: RoadmapSelectionFieldProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { roadmapsForSubdomain, roadmapsLoading } =
    useRoadmapOptionsForSubdomain(subDomainId);

  const handleCreateNewRoadmap = () => {
    if (onCreateNewRoadmap) {
      onCreateNewRoadmap();
      return;
    }

    const currentPath = `${location.pathname}${location.search}`;
    navigate(`/roadmap/create?returnTo=${encodeURIComponent(currentPath)}`);
  };

  return (
    <div className="space-y-3">
      {showCreateLink && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCreateNewRoadmap}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Create New Roadmap
          </button>
        </div>
      )}

      {roadmapsLoading && (
        <p className="text-xs text-[#64748B]">Loading roadmaps…</p>
      )}

      {!roadmapsLoading &&
        subDomainId > 0 &&
        roadmapsForSubdomain.length === 0 && (
          <p className="text-xs text-[#64748B]">
            No published roadmaps match this sub-domain, or none are available.
          </p>
        )}

      <select
        value={value ?? ""}
        onChange={(event) => {
          const selected = event.target.value;
          onChange(selected ? Number(selected) : null);
        }}
        className={className}
      >
        {allowEmpty && <option value="">{emptyOptionLabel}</option>}
        {roadmapsForSubdomain.map((roadmap) => (
          <option key={roadmap.roadmapId} value={roadmap.roadmapId}>
            {roadmap.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export { PENDING_CREATE_PROGRAM_DRAFT_KEY };
