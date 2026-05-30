import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  UploadCloud,
} from "lucide-react";

import ModalBase from "../shared/ModalBase";

import type { LocalTask } from "../../../types/roadmap";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

import {
  uploadTaskAttachment,
} from "../../../services/roadmapService";

import { validateTaskInput } from "../../../validators/roadmap/index";

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

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [deadline, setDeadline] =
    useState("");

  const [attachmentUrl, setAttachmentUrl] =
    useState("");

  const [fileName, setFileName] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [uploadingFile, setUploadingFile] =
    useState(false);

  const [taskErrors, setTaskErrors] =
    useState<
      Partial<{
        title: string;
        description: string;
        deadline: string;
        attachmentUrl: string;
      }>
    >({});

  useEffect(() => {

    if (!task) return;

    setTitle(task.title);

    setDescription(
      task.description || ""
    );

    setDeadline(
      task.deadline
        ? task.deadline.split("T")[0]
        : ""
    );

    setAttachmentUrl(
      typeof task.attachmentUrl === "string"
        ? task.attachmentUrl
        : ""
    );

    if (task.attachmentUrl) {

      const parts =
        task.attachmentUrl.split("/");

      setFileName(
        parts[parts.length - 1]
      );
    }

  }, [task]);

  const handleFileUpload = async (
    file: File
  ) => {

    try {

      setUploadingFile(true);

      const uploadedUrl =
        await uploadTaskAttachment(file);

      setAttachmentUrl(uploadedUrl);

      setFileName(file.name);

    } catch (error) {

      console.error(error);

    } finally {

      setUploadingFile(false);
    }
  };

  const handleSave = async () => {

    if (!task) return;

    const errors = validateTaskInput({
      title,
      description,
      deadline:
        deadline || undefined,

      attachmentUrl:
        attachmentUrl.trim(),
    });

    if (errors) {

      setTaskErrors(errors);

      return;
    }

    setTaskErrors({});

    setSaving(true);

    const trimmedUrl =
      attachmentUrl.trim();

    await updateTask(
      phaseId,
      topicId,
      task._localId,
      {
        title,

        description:
          description || "",

        deadLine:
          deadline || null,

        attachmentUrl:
          trimmedUrl || undefined,
      }
    );

    setSaving(false);

    const hadError =
      !!useRoadmapBuilderStore
        .getState()
        .error;

    if (!hadError) {
      onClose();
    }
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
            onChange={(e) => {

              setTitle(
                e.target.value
              );

              if (
                taskErrors.title
              ) {

                setTaskErrors((p) => ({
                  ...p,
                  title: undefined,
                }));
              }
            }}
            className="
              w-full h-12 rounded-2xl
              bg-[#F3F5F9]
              px-4 outline-none
            "
          />

          {taskErrors.title && (
            <p
              className="
                mt-1 text-sm
                text-red-600
                font-medium
              "
            >
              {taskErrors.title}
            </p>
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

              setDescription(
                e.target.value
              );

              if (
                taskErrors.description
              ) {

                setTaskErrors((p) => ({
                  ...p,
                  description:
                    undefined,
                }));
              }
            }}
            className="
              w-full rounded-2xl
              bg-[#F3F5F9]
              p-4 outline-none
              resize-none
            "
          />

          {taskErrors.description && (
            <p
              className="
                mt-1 text-sm
                text-red-600
                font-medium
              "
            >
              {taskErrors.description}
            </p>
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

              setDeadline(
                e.target.value
              );

              if (
                taskErrors.deadline
              ) {

                setTaskErrors((p) => ({
                  ...p,
                  deadline:
                    undefined,
                }));
              }
            }}
            className="
              w-full h-12 rounded-2xl
              bg-[#F3F5F9]
              px-4 outline-none
            "
          />

          {taskErrors.deadline && (
            <p
              className="
                mt-1 text-sm
                text-red-600
                font-medium
              "
            >
              {taskErrors.deadline}
            </p>
          )}

        </div>

        {/* attachment upload */}
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

          <div
            className="
              border-2 border-dashed
              border-[#D0D5DD]
              rounded-2xl
              p-6
              bg-[#F9FAFB]
            "
          >

            <label
              className="
                flex flex-col items-center
                justify-center
                gap-3
                cursor-pointer
              "
            >

              <UploadCloud
                size={28}
                className="
                  text-[#667085]
                "
              />

              <span
                className="
                  text-sm
                  text-[#475467]
                  font-medium
                "
              >
                {uploadingFile
                  ? "Uploading..."
                  : "Click to upload file"}
              </span>

              <input
                type="file"
                className="hidden"
                onChange={async (e) => {

                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  await handleFileUpload(
                    file
                  );
                }}
              />

            </label>

            {attachmentUrl && (

              <div
                className="
                  mt-4 flex items-center
                  justify-between
                  rounded-2xl
                  border border-[#D0D5DD]
                  bg-white
                  px-4 py-3
                "
              >

                <div
                  className="
                    flex items-center gap-3
                    min-w-0
                  "
                >

                  <div
                    className="
                      h-10 w-10 rounded-xl
                      bg-[#F2F4F7]
                      flex items-center
                      justify-center
                      shrink-0
                    "
                  >
                    📎
                  </div>

                  <div className="min-w-0">

                    <p
                      className="
                        text-sm font-medium
                        text-[#101828]
                        truncate
                      "
                    >
                      {fileName ||
                        "Uploaded file"}
                    </p>

                    <p
                      className="
                        text-xs text-[#667085]
                      "
                    >
                      File attached successfully
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => {

                    setAttachmentUrl("");
                    setFileName("");
                  }}
                  className="
                    text-sm font-medium
                    text-red-600
                    hover:text-red-700
                  "
                >
                  Remove
                </button>

              </div>
            )}

          </div>

          {taskErrors.attachmentUrl && (
            <p
              className="
                mt-2 text-sm
                text-red-600
                font-medium
              "
            >
              {taskErrors.attachmentUrl}
            </p>
          )}

        </div>

        {/* footer */}
        <div
          className="
            flex justify-end
            gap-4 pt-2
          "
        >

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
            disabled={
              saving || uploadingFile
            }
            className="
              h-12 px-7 rounded-2xl
              bg-primary text-white
              font-semibold
              shadow-lg shadow-primary/20
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {saving
              ? "Saving…"
              : "Save Changes"}

          </button>

        </div>

      </div>

    </ModalBase>
  );
}