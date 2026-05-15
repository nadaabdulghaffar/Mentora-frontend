import { useState } from "react";

import {
  ROADMAP_STATUS,
  normalizeRoadmapStatus,
} from "../../../types/roadmap";
import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

import PhaseCard from "../roadmap/PhaseCard";
import RoadmapNotice from "../shared/RoadmapNotice";

export default function ContentStep() {
  const phases = useRoadmapBuilderStore(
    (state) => state.phases
  );

  const collapseAll = useRoadmapBuilderStore(
    (state) => state.collapseAll
  );

  const expandAll = useRoadmapBuilderStore(
    (state) => state.expandAll
  );

  const addPhase = useRoadmapBuilderStore(
    (state) => state.addPhase
  );

  const error = useRoadmapBuilderStore(
    (state) => state.error
  );

  const mode = useRoadmapBuilderStore((state) => state.mode);
  const basicInfo = useRoadmapBuilderStore((state) => state.basicInfo);
  const dismissError = useRoadmapBuilderStore(
    (state) => state.dismissError
  );

  const publishedEdit =
    mode === "edit" &&
    normalizeRoadmapStatus(basicInfo.status) ===
      ROADMAP_STATUS.Published;

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddPhase = async () => {
    if (!title.trim()) return;

    setSaving(true);
    await addPhase({
      title,
      summary,
      order: phases.length + 1,
      topics: [],
    });
    setSaving(false);

    setTitle("");
    setSummary("");
    setShowForm(false);
  };

  return (
    <div className="max-w-[1050px] mx-auto px-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[32px] font-bold text-[#1F2432]">
              Build Your Roadmap
            </h1>
            <p className="mt-2 text-[#7B869C] text-[16px]">
              Organize your roadmap into phases, topics,
              materials, and tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="
                h-10 px-4 rounded-2xl
                border border-[#D0D5DD]
                text-[#475467]
                text-sm font-semibold
                hover:bg-[#F2F4F7]
                transition
              "
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="
                h-10 px-4 rounded-2xl
                border border-[#D0D5DD]
                text-[#475467]
                text-sm font-semibold
                hover:bg-[#F2F4F7]
                transition
              "
            >
              Collapse All
            </button>
          </div>
        </div>

      </div>

      {publishedEdit ? (
        <div className="mt-6">
          <RoadmapNotice
            variant="info"
            message="This roadmap is live. You can add topics and edit content here; use Save draft to persist. Removing published topics or phases is not supported."
            splitMessageToList={false}
          />
        </div>
      ) : null}

      {error ? (
        <div className="mt-6">
          <RoadmapNotice
            message={error}
            splitMessageToList
            onDismiss={dismissError}
          />
        </div>
      ) : null}

      {/* Phase List */}
      <div className="mt-8 space-y-6">
        {phases.map((phase) => (
          <PhaseCard
            key={phase._localId}
            phase={phase}
          />
        ))}
      </div>

      {/* Add Phase */}
      <div className="mt-8">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="
              w-full border-2 border-dashed
              border-[#D7DCE5]
              rounded-[24px]
              py-6
              text-[#667085]
              font-medium
              hover:border-primary
              hover:text-primary
              transition
            "
          >
            + Add New Phase
          </button>
        ) : (
          <div className="bg-white rounded-[24px] p-6">
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  PHASE TITLE
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="
                    w-full h-12 rounded-2xl
                    bg-[#F3F5F9]
                    px-4 outline-none
                  "
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  SUMMARY
                </label>

                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="
                    w-full rounded-2xl
                    bg-[#F3F5F9]
                    p-4 outline-none
                    resize-none
                  "
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="
                    h-11 px-5 rounded-xl
                    border border-[#D0D5DD]
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddPhase}
                  disabled={saving}
                  className="
                    h-11 px-5 rounded-xl
                    bg-primary text-white
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {saving ? "Saving…" : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}