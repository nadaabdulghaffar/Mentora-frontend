import { useState } from "react";

import { CalendarDays } from "lucide-react";

import ModalBase from "../shared/ModalBase";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";
import { validateTaskInput } from "../../../validators/roadmap/index";

interface Props {
  open: boolean;
  onClose: () => void;
  phaseId: string;
  topicId: string;
}

export default function AddTaskModal({
  open,
  onClose,
  phaseId,
  topicId,
}: Props) {
  const addTask = useRoadmapBuilderStore(
    (state) => state.addTask
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [taskErrors, setTaskErrors] = useState<Partial<{ title: string; description: string; deadline: string; attachmentUrl: string }>>({});

  const handleSave = async () => {
    const errors = validateTaskInput({ title, description, deadline: deadline || undefined, attachmentUrl: attachmentUrl.trim() });
    if (errors) {
      setTaskErrors(errors);
      return;
    }

    setTaskErrors({});
    setSaving(true);
    const trimmedUrl = attachmentUrl.trim();
    await addTask(phaseId, topicId, {
      title,
      description,
      deadline: deadline || undefined,
      attachmentUrl: trimmedUrl,
    });
    setSaving(false);
    const hadError = !!useRoadmapBuilderStore.getState().error;
    if (!hadError) {
      setTitle("");
      setDescription("");
      setDeadline("");
      setAttachmentUrl("");
      setTaskErrors({});
      onClose();
    }
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Add Task"
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
            onChange={(e) => {
              setTitle(e.target.value);
              if (taskErrors.title) setTaskErrors((p) => ({ ...p, title: undefined }));
            }}
            placeholder="Enter task title"
            className="
              w-full h-12 rounded-2xl
              bg-[#F3F5F9]
              px-4 outline-none
            "
          />
          {taskErrors.title && (
            <p className="mt-1 text-sm text-red-600 font-medium">{taskErrors.title}</p>
          )}
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
            onChange={(e) => {
              setDescription(e.target.value);
              if (taskErrors.description) setTaskErrors((p) => ({ ...p, description: undefined }));
            }}
            placeholder="Describe the task..."
            className="
              w-full rounded-2xl
              bg-[#F3F5F9]
              p-4 outline-none
              resize-none
            "
          />
          {taskErrors.description && (
            <p className="mt-1 text-sm text-red-600 font-medium">{taskErrors.description}</p>
          )}
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
            DEADLINE (OPTIONAL)
          </label>

          <input
            type="date"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              if (taskErrors.deadline) setTaskErrors((p) => ({ ...p, deadline: undefined }));
            }}
            className="
              w-full h-12 rounded-2xl
              bg-[#F3F5F9]
              px-4 outline-none
            "
          />
          {taskErrors.deadline && (
            <p className="mt-1 text-sm text-red-600 font-medium">{taskErrors.deadline}</p>
          )}
        </div>

        {/* attachment URL */}
        <div>
          <label
            className="
              block text-xs font-bold
              tracking-wide
              text-[#475467]
              mb-2
            "
          >
            ATTACHMENT URL
          </label>

          <input
            type="url"
            placeholder="https://example.com/resource"
            value={attachmentUrl}
            onChange={(e) => {
              setAttachmentUrl(e.target.value);
              if (taskErrors.attachmentUrl) setTaskErrors((p) => ({ ...p, attachmentUrl: undefined }));
            }}
            className="
              w-full h-12 rounded-2xl
              bg-[#F3F5F9]
              px-4 outline-none
            "
          />
          {taskErrors.attachmentUrl && (
            <p className="mt-1 text-sm text-red-600 font-medium">{taskErrors.attachmentUrl}</p>
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
            {saving ? "Saving…" : "Save Task"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}