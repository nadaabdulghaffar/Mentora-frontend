import {
  useEffect,
  useState,
} from "react";

import { CalendarDays } from "lucide-react";

import ModalBase from "../shared/ModalBase";

import type { LocalTask } from "../../../types/roadmap";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

interface Props {
  open: boolean;
  onClose: () => void;
  task: LocalTask | null;
  phaseId: string;
  topicId: string;
}

export default function EditTaskModal({
  open,
  onClose,
  task,
  phaseId,
  topicId,
}: Props) {
  const updateTask = useRoadmapBuilderStore(
    (state) => state.updateTask
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || "");
    setDeadline(task.deadline || "");
    setAttachmentUrl(task.attachmentUrl || "");
  }, [task]);

 const handleSave = async () => {
  if (!task) return;

  console.log({
    title,
    description,
    deadline,
    attachmentUrl,
  });

  setSaving(true);
  
await updateTask(
  phaseId,
  topicId,
  task._localId,
  {
    title,
    description: description || "",
    deadLine: deadline || null,
    attachmentUrl: attachmentUrl.trim() || "",
  }
);

  setSaving(false);

  const hadError =
    !!useRoadmapBuilderStore.getState().error;

  if (!hadError) onClose();
};

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Edit Task"
      maxWidth="max-w-[720px]"
    >
      <div className="space-y-6">
        {/* title */}
        <div>
          <label
            className="
              block text-xs font-bold
              tracking-wide
              text-[#475467]
              mb-2
            "
          >
            TASK TITLE
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

        {/* description */}
        <div>
          <label
            className="
              block text-xs font-bold
              tracking-wide
              text-[#475467]
              mb-2
            "
          >
            DESCRIPTION
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="
              w-full rounded-2xl
              bg-[#F3F5F9]
              p-4 outline-none
              resize-none
            "
          />
        </div>

        {/* deadline */}
        <div>
          <label
            className="
              flex items-center gap-2
              text-xs font-bold
              tracking-wide
              text-[#475467]
              mb-2
            "
          >
            <CalendarDays size={15} />
            DEADLINE
          </label>

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="
              w-full h-12 rounded-2xl
              bg-[#F3F5F9]
              px-4 outline-none
            "
          />
        </div>

       <div>
  <label
    className="
      block text-xs font-bold
      tracking-wide
      text-[#475467]
      mb-2
    "
  >
    ATTACHMENT (OPTIONAL)
  </label>

  {!attachmentUrl ? (
    <label
      className="
        flex items-center justify-center
        w-full h-[120px]
        rounded-2xl
        border-2 border-dashed
        border-primary/20
        bg-[#F9FAFB]
        cursor-pointer
        hover:bg-primary/5
        transition
      "
    >
      <div className="text-center">
        <p className="font-semibold text-primary">
          Upload File
        </p>

        <p className="text-sm text-[#667085] mt-1">
          PDF, DOC, ZIP...
        </p>
      </div>

      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          setAttachmentUrl(file.name);
        }}
      />
    </label>
  ) : (
    <div
      className="
        flex items-center justify-between
        p-4 rounded-2xl
        bg-[#F3F5F9]
        border border-[#E4E7EC]
      "
    >
      <p className="font-medium text-[#344054]">
        {attachmentUrl}
      </p>

      <button
        type="button"
        onClick={() => setAttachmentUrl("")}
        className="
          w-8 h-8 rounded-full
          bg-[#FDECEC]
          text-red-500
          flex items-center justify-center
          hover:opacity-80
        "
      >
        ✕
      </button>
    </div>
  )}
</div>

        {/* footer */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            onClick={onClose}
            className="
              h-11 px-6 rounded-2xl
              text-[#344054]
              font-medium
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="
              h-12 px-7 rounded-2xl
              bg-primary text-white
              font-semibold
              shadow-lg shadow-primary/20
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}