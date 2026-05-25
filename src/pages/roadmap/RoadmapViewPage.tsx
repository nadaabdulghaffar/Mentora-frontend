import { useEffect, useMemo } from "react";

import { useParams } from "react-router-dom";

import { BarChart3, Clock4 } from "lucide-react";

import Layout from "../../shared/components/Layout";

import PhaseCard from "../../components/roadmap-builder/roadmap/PhaseCard";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";

function formatDurationWeeks(duration?: number) {
  if (!duration || duration <= 0) return "—";
  return `${duration} week${duration === 1 ? "" : "s"}`;
}

export default function RoadmapViewPage() {
  const { roadmapId } = useParams();

  const loadForView = useRoadmapBuilderStore((s) => s.loadForView);
  const loadExperienceLevels = useRoadmapBuilderStore((s) => s.loadExperienceLevels);

  const isLoading = useRoadmapBuilderStore((s) => s.isSaving);
  const error = useRoadmapBuilderStore((s) => s.error);

  const basicInfo = useRoadmapBuilderStore((s) => s.basicInfo);
  const phases = useRoadmapBuilderStore((s) => s.phases);
  const experienceLevels = useRoadmapBuilderStore((s) => s.experienceLevels);

  const collapseAll = useRoadmapBuilderStore((s) => s.collapseAll);
  const expandAll = useRoadmapBuilderStore((s) => s.expandAll);

  useEffect(() => {
    const id = roadmapId ? Number(roadmapId) : NaN;
    if (Number.isFinite(id)) {
      loadForView(id);
    }
  }, [loadForView, roadmapId]);

  useEffect(() => {
    if (experienceLevels.length === 0) loadExperienceLevels();
  }, [experienceLevels.length, loadExperienceLevels]);

  const levelLabel = useMemo(() => {
    const from = basicInfo.targetLevelFrom;
    const to = basicInfo.targetLevelTo;

    if (from == null && to == null) return "All levels";

    const nameFor = (id?: number) =>
      id == null
        ? undefined
        : experienceLevels.find((x) => x.id === id)?.name ?? `Level ${id}`;

    const fromName = nameFor(from);
    const toName = nameFor(to);

    if (fromName && toName) {
      return from === to ? fromName : `${fromName} → ${toName}`;
    }
    return fromName ?? toName ?? "All levels";
  }, [basicInfo.targetLevelFrom, basicInfo.targetLevelTo, experienceLevels]);

  return (
    <Layout>
      <div className="max-w-[1050px] mx-auto px-4 space-y-6">
        {/* 1) BASIC INFO HEADER CARD */}
        <div className="bg-white rounded-[24px] border border-[#ECEFF5] px-7 py-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-[32px] leading-[40px] font-bold text-[#1F2432]">
                {basicInfo.title || "Roadmap"}
              </h1>
              <p className="mt-2 text-[16px] text-[#7B869C] leading-7">
                {basicInfo.description || "—"}
              </p>
            </div>

            <div className="flex items-center gap-7 shrink-0">
              <div className="flex items-center gap-2 text-[#667085] text-sm font-semibold">
                <BarChart3 size={16} className="text-primary" />
                <span>Level: {levelLabel}</span>
              </div>

              <div className="flex items-center gap-2 text-[#667085] text-sm font-semibold">
                <Clock4 size={16} className="text-primary" />
                <span>Duration: {formatDurationWeeks(basicInfo.duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2) COLLAPSE CONTROLS SECTION */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-[20px] font-bold text-[#1F2432]">
            Roadmap Structure
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="text-primary text-sm font-semibold hover:opacity-80 transition"
            >
              Expand All
            </button>
            <span className="text-[#D0D5DD]">|</span>
            <button
              onClick={collapseAll}
              className="text-primary text-sm font-semibold hover:opacity-80 transition"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading ? (
          <div className="text-center py-14 text-[#667085]">
            Loading roadmap...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 font-medium">{error}</div>
        ) : null}

        {/* 3) ROADMAP STRUCTURE SECTION */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {phases.map((phase) => (
              <PhaseCard key={phase._localId} phase={phase} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

