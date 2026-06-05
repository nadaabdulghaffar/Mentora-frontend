import { useState } from "react";

import {
  Pencil,
  Trash2,
  CalendarDays,
  Paperclip,
  Circle,
  Eye,
} from "lucide-react";

import type { LocalTask } from "../../../types/roadmap";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

import EditTaskModal from "../modals/EditTaskModal";

interface Props {
  task: LocalTask;

  phaseId: string;

  topicId: string;
}

export default function TaskItem({
  task,
  phaseId,
  topicId,
}: Props) {
  const mode = useRoadmapBuilderStore((s) => s.mode);
  const readonly = mode === "view";

  const deleteTask =
    useRoadmapBuilderStore(
      (state) => state.deleteTask
    );

  const [openEdit, setOpenEdit] =
    useState(false);
  const [openView, setOpenView] =
  useState(false);

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <>
      <div
        className="
          h-[52px]
          rounded-2xl
          bg-[#F3F5F9]
          px-4
          flex items-center justify-between
          gap-4
        "
      >
        {/* left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* task circle */}
          <Circle
            size={16}
            className="
              text-[#98A2B3]
              shrink-0
            "
          />

          {/* title */}
          <p
            className="
              text-[15px]
              text-[#1F2432]
              truncate
            "
          >
            {task.title}
          </p>

          {/* deadline */}
          {task.deadline && (
            <div
              className="
                hidden md:flex
                items-center gap-1
                text-[12px]
                text-[#667085]
                bg-white
                px-2 py-1
                rounded-lg
                shrink-0
              "
            >
              <CalendarDays
                size={13}
              />

              <span>
                {formatDate(
                  task.deadline
                )}
              </span>
            </div>
          )}

          {/* attachment */}
          {task.attachmentUrl && (
            <div
              className="
                hidden md:flex
                items-center gap-1
                text-[12px]
                text-primary
                bg-primary/10
                px-2 py-1
                rounded-lg
                shrink-0
              "
            >
              <Paperclip
                size={13}
              />

              <span>
                Attachment
              </span>
            </div>
          )}
        </div>

        {/* actions */}
<div className="flex items-center gap-3 shrink-0">

  <button
    onClick={() => setOpenView(true)}
    className="
      text-[#667085]
      hover:text-primary
      transition
    "
  >
    <Eye size={17} />
  </button>

  {!readonly && (
    <>
      <button
        onClick={() => setOpenEdit(true)}
        className="
          text-[#667085]
          hover:text-primary
          transition
        "
      >
        <Pencil size={17} />
      </button>

      <button
        onClick={() =>
          deleteTask(
            phaseId,
            topicId,
            task._localId
          )
        }
        className="
          text-[#667085]
          hover:text-red-500
          transition
        "
      >
        <Trash2 size={17} />
      </button>
    </>
  )}

</div>
</div>
      {!readonly && (
        <EditTaskModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          task={task}
          phaseId={phaseId}
          topicId={topicId}
        />
      )}
      <EditTaskModal
  open={openView}
  onClose={() => setOpenView(false)}
  task={task}
  phaseId={phaseId}
  topicId={topicId}
  readOnly
/>
    </>
  );
}