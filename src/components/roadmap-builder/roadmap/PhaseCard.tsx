import { useEffect, useState } from "react";

import {
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";

import type { LocalPhase } from "../../../types/roadmap";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

import TopicCard from "./TopicCard";

interface Props {
  phase: LocalPhase;
}

export default function PhaseCard({ phase }: Props) {
  const mode = useRoadmapBuilderStore((s) => s.mode);
  const readonly = mode === "view";

  const updatePhase = useRoadmapBuilderStore(
    (state) => state.updatePhase
  );

  const deletePhase = useRoadmapBuilderStore(
    (state) => state.deletePhase
  );

  const addTopic = useRoadmapBuilderStore(
    (state) => state.addTopic
  );

  const isCollapsed = useRoadmapBuilderStore(
    (state) => state.isPhaseCollapsed(phase._localId)
  );

  const toggleCollapsed = useRoadmapBuilderStore(
    (state) => state.togglePhaseCollapsed
  );

  const [editing, setEditing] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);

  const [title, setTitle] = useState(phase.title);
  const [summary, setSummary] = useState(phase.summary);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicSummary, setTopicSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingTopic, setAddingTopic] = useState(false);

  useEffect(() => {
    if (readonly) {
      setEditing(false);
      setShowTopicForm(false);
    }
  }, [readonly]);

  const handleSave = async () => {
    setSaving(true);
    await updatePhase(phase._localId, { title, summary });
    setSaving(false);
    setEditing(false);
  };

  const handleAddTopic = async () => {
    if (!topicTitle.trim()) return;

    setAddingTopic(true);
    await addTopic(phase._localId, {
      title: topicTitle,
      summary: topicSummary,
      order: phase.topics.length + 1,
      materials: [],
      tasks: [],
    });
    setAddingTopic(false);

    setTopicTitle("");
    setTopicSummary("");
    setShowTopicForm(false);
  };

  return (
    <div className="bg-white rounded-[28px] p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editing && !readonly ? (
            <div className="space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="
                  w-full h-12 rounded-2xl
                  bg-[#F3F5F9]
                  px-4 outline-none
                "
              />

              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="
                  w-full rounded-2xl
                  bg-[#F3F5F9]
                  p-4 outline-none
                  resize-none
                "
              />

              <button
                onClick={handleSave}
                disabled={saving}
                className="
                  h-10 px-5 rounded-xl
                  bg-primary text-white
                  disabled:opacity-50
                "
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleCollapsed(phase._localId)}
                  className="
                    w-10 h-10 rounded-xl
                    bg-[#F3F5F9]
                    flex items-center justify-center
                    hover:bg-[#ECEFF5]
                    transition
                  "
                  aria-label={
                    isCollapsed ? "Expand phase" : "Collapse phase"
                  }
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                  />
                </button>

                <h2 className="text-[22px] font-bold text-[#1F2432]">
                  Phase {phase.order}: {phase.title}
                </h2>
              </div>

              <p className="mt-2 text-[#667085]">
                {phase.summary}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && !readonly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="
                w-10 h-10 rounded-xl
                bg-[#F3F5F9]
                flex items-center justify-center
              "
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={() => deletePhase(phase._localId)}
              className="
                w-10 h-10 rounded-xl
                bg-[#FDECEC]
                text-red-500
                flex items-center justify-center
              "
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Collapsible content */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"}
        `}
      >
        {/* Topics */}
        <div className="mt-6 space-y-5">
          {phase.topics.map((topic) => (
            <TopicCard
              key={topic._localId}
              phaseId={phase._localId}
              topic={topic}
            />
          ))}
        </div>

        {/* Add Topic */}
        {!readonly && (
          <div className="mt-6">
            {!showTopicForm ? (
              <button
                onClick={() => setShowTopicForm(true)}
                className="
                  flex items-center gap-2
                  text-primary font-medium
                "
              >
                <Plus size={18} />
                Add Topic
              </button>
            ) : (
              <div className="border border-[#E4E7EC] rounded-2xl p-5 mt-4">
                <div className="space-y-4">
                  <input
                    placeholder="Topic title"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="
                      w-full h-12 rounded-2xl
                      bg-[#F3F5F9]
                      px-4 outline-none
                    "
                  />

                  <textarea
                    rows={3}
                    placeholder="Summary"
                    value={topicSummary}
                    onChange={(e) => setTopicSummary(e.target.value)}
                    className="
                      w-full rounded-2xl
                      bg-[#F3F5F9]
                      p-4 outline-none
                      resize-none
                    "
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowTopicForm(false)}
                      className="
                        h-10 px-5 rounded-xl
                        border border-[#D0D5DD]
                      "
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleAddTopic}
                      disabled={addingTopic}
                      className="
                        h-10 px-5 rounded-xl
                        bg-primary text-white
                        disabled:opacity-50
                      "
                    >
                      {addingTopic ? "Saving…" : "OK"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}