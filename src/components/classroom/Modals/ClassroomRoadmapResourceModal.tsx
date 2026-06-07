import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { classroomService } from "../../../services/classroomService";
import { uploadTaskAttachment } from "../../../services/roadmapService";

type ResourceMode = "pdf" | "link";

type ClassroomRoadmapResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  programId: number;
  onSuccess: () => Promise<void> | void;
};

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export default function ClassroomRoadmapResourceModal({
  isOpen,
  onClose,
  programId,
  onSuccess,
}: ClassroomRoadmapResourceModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<ResourceMode>("pdf");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setMode("pdf");
    setSelectedFile(null);
    setExternalUrl("");
    setSubmitAttempted(false);
    setIsSaving(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modeError =
    submitAttempted && !mode
      ? "Choose either PDF or External Link."
      : null;

  const fileError =
    submitAttempted && mode === "pdf" && !selectedFile
      ? "PDF file is required."
      : null;

  const linkError = (() => {
    if (!submitAttempted || mode !== "link") {
      return null;
    }

    const trimmed = externalUrl.trim();
    if (!trimmed) {
      return "URL is required.";
    }

    if (!isValidHttpUrl(trimmed)) {
      return "Enter a valid http or https URL.";
    }

    return null;
  })();

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSave = async () => {
    setSubmitAttempted(true);

    if (mode === "pdf" && !selectedFile) {
      return;
    }

    if (mode === "link") {
      const trimmed = externalUrl.trim();
      if (!trimmed || !isValidHttpUrl(trimmed)) {
        return;
      }
    }

    try {
      setIsSaving(true);

      if (mode === "pdf" && selectedFile) {
        if (
          selectedFile.type !== "application/pdf" &&
          !selectedFile.name.toLowerCase().endsWith(".pdf")
        ) {
          toast.error("Please upload a PDF file.");
          return;
        }

        const fileUrl = await uploadTaskAttachment(selectedFile);
        const response = await classroomService.upsertClassroomRoadmapResource(
          programId,
          {
            resourceType: "Pdf",
            fileUrl,
            fileName: selectedFile.name,
          }
        );

        if (!response?.success) {
          throw new Error(response?.message || "Failed to save roadmap PDF.");
        }

        toast.success("Classroom roadmap PDF saved.");
      } else {
        const response = await classroomService.upsertClassroomRoadmapResource(
          programId,
          {
            resourceType: "ExternalLink",
            externalUrl: externalUrl.trim(),
          }
        );

        if (!response?.success) {
          throw new Error(response?.message || "Failed to save external link.");
        }

        toast.success("External roadmap link saved.");
      }

      await onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save classroom roadmap resource."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-roadmap-resource-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="upload-roadmap-resource-title"
              className="text-xl font-bold text-[#1F2432]"
            >
              Upload your roadmap
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              Share a classroom reference document. This does not create or
              attach a curriculum roadmap.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F4F6FA]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-[#1F2432]">
            Choose one option
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setMode("pdf")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "pdf"
                  ? "bg-[#5E4BC5] text-white"
                  : "border border-[#D6DBE8] bg-white text-[#4D5670] hover:bg-[#F7F8FB]"
              }`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setMode("link")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === "link"
                  ? "bg-[#5E4BC5] text-white"
                  : "border border-[#D6DBE8] bg-white text-[#4D5670] hover:bg-[#F7F8FB]"
              }`}
            >
              External Link
            </button>
          </div>

          {modeError && (
            <p className="text-sm font-medium text-red-600">{modeError}</p>
          )}

          {mode === "pdf" ? (
            <div className="space-y-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-[#CFC7FF] bg-[#F5F3FF] px-5 py-3 text-sm font-semibold text-[#5E4BC5] transition hover:bg-[#EDE9FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? "Change PDF" : "Select PDF"}
              </button>
              {selectedFile && (
                <p className="text-sm text-[#4D5670]">{selectedFile.name}</p>
              )}
              {fileError && (
                <p className="text-sm font-medium text-red-600">{fileError}</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                value={externalUrl}
                onChange={(event) => setExternalUrl(event.target.value)}
                placeholder="https://example.com/roadmap"
                className="w-full rounded-xl border border-[#E6E9F2] bg-[#F4F6FA] px-4 py-3 text-sm text-[#1F2432] outline-none transition placeholder:text-[#9AA1B1] focus:border-[#5E4BC5] focus:bg-white"
              />
              {linkError && (
                <p className="text-sm font-medium text-red-600">{linkError}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-xl border border-[#D6DBE8] bg-white px-5 py-3 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F7F8FB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-[#5E4BC5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F3DB0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
