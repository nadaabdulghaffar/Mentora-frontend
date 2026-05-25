import { useEffect, useState } from "react";

import {
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";

import type { LocalTopic } from "../../../types/roadmap";

import { hasDuplicateTopicTitleAcrossRoadmap } from "../../../validators/roadmap/index";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

import MaterialItem from "./MaterialItem";
import TaskItem from "./TaskItem";
import AddMaterialModal from "../modals/AddMaterialModal";
import AddTaskModal from "../modals/AddTaskModal";

interface Props {
  topic: LocalTopic;
  phaseId: string;
}

export default function TopicCard({ topic, phaseId }: Props) {
  const mode = useRoadmapBuilderStore((s) => s.mode);
  const readonly = mode === "view";

  const updateTopic = useRoadmapBuilderStore(
    (state) => state.updateTopic
  );

  const deleteTopic = useRoadmapBuilderStore(
    (state) => state.deleteTopic
  );

  const isCollapsed = useRoadmapBuilderStore(
    (state) => state.isTopicCollapsed(topic._localId)
  );

  const toggleCollapsed = useRoadmapBuilderStore(
    (state) => state.toggleTopicCollapsed
  );

  const phases = useRoadmapBuilderStore((state) => state.phases);
  const [editing, setEditing] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [title, setTitle] = useState(topic.title);
  const [summary, setSummary] = useState(topic.summary);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (readonly) {
      setEditing(false);
      setShowMaterialModal(false);
      setShowTaskModal(false);
    }
  }, [readonly]);

  const handleSaveTopic = async () => {
    if (!title.trim()) {
      return;
    }

    if (
      hasDuplicateTopicTitleAcrossRoadmap(phases, title, {
        phaseLocalId: phaseId,
        topicLocalId: topic._localId,
      })
    ) {
      return;
    }

    setSaving(true);
    await updateTopic(phaseId, topic._localId, { title, summary });
    setSaving(false);
    setEditing(false);
  };

  return (
    <>
      <div
        className="
          border-2 border-primary/20
          rounded-[28px]
          p-6
          bg-[#FCFCFD]
        "
      >
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
                    bg-white
                    border border-[#E4E7EC]
                    px-4 outline-none
                  "
                />

                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="
                    w-full rounded-2xl
                    bg-white
                    border border-[#E4E7EC]
                    p-4 outline-none
                    resize-none
                  "
                />

                <button
                  onClick={handleSaveTopic}
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
                    onClick={() => toggleCollapsed(topic._localId)}
                    className="
                      w-9 h-9 rounded-xl
                      bg-white
                      border border-[#E4E7EC]
                      flex items-center justify-center
                      hover:bg-[#F2F4F7]
                      transition
                    "
                    aria-label={
                      isCollapsed ? "Expand topic" : "Collapse topic"
                    }
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                    />
                  </button>

                  <h3
                    className="
                      text-[20px]
                      font-bold
                      text-[#1F2432]
                    "
                  >
                    {topic.title}
                  </h3>
                </div>

                <p
                  className="
                    mt-2
                    text-[#667085]
                    leading-7
                  "
                >
                  {topic.summary}
                </p>
              </>
            )}
          </div>

          {!editing && !readonly && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="
                  w-10 h-10 rounded-xl
                  bg-white
                  border border-[#E4E7EC]
                  flex items-center justify-center
                "
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={() =>
                  deleteTopic(phaseId, topic._localId)
                }
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
            ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[4000px] opacity-100"}
          `}
        >
          {/* MATERIALS */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h4
                className="
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#344054]
                "
              >
                Materials
              </h4>

              {!readonly && (
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="
                    flex items-center gap-2
                    text-primary
                    text-sm
                    font-semibold
                    hover:opacity-80
                    transition
                  "
                >
                  <Plus size={16} />
                  Add Material
                </button>
              )}
            </div>

            {/* Materials List */}
            <div className="mt-4 space-y-3">
              {topic.materials.map((material) => (
                <MaterialItem
                  key={material._localId}
                  material={material}
                  phaseId={phaseId}
                  topicId={topic._localId}
                />
              ))}
            </div>
          </div>

          {/* TASKS */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h4
                className="
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#344054]
                "
              >
                Tasks
              </h4>

              {!readonly && (
                <button
                  type="button"
                  onClick={() => setShowTaskModal(true)}
                  title="Add or manage tasks"
                  className="
                    flex items-center gap-2
                    text-sm font-semibold transition
                    text-primary hover:opacity-80
                  "
                >
                  <Plus size={16} />
                  Add Task
                </button>
              )}
            </div>

            {/* Tasks */}
            {topic.tasks.length > 0 ? (
              <div className="mt-4 space-y-3">
                {topic.tasks.map((task) => (
                  <TaskItem
                    key={task._localId}
                    task={task}
                    phaseId={phaseId}
                    topicId={topic._localId}
                  />
                ))}
              </div>
            ) : (
              <div
                className="
                  mt-4
                  rounded-2xl
                  border border-dashed
                  border-[#D0D5DD]
                  p-6
                  text-center
                  text-sm
                  text-[#98A2B3]
                "
              >
                No task added yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {!readonly && (
        <>
          <AddMaterialModal
            open={showMaterialModal}
            onClose={() => setShowMaterialModal(false)}
            phaseId={phaseId}
            topicId={topic._localId}
          />

          <AddTaskModal
            open={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            phaseId={phaseId}
            topicId={topic._localId}
          />
        </>
      )}
    </>
  );
}