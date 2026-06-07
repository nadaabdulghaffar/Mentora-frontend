import { Download, ExternalLink, FileText, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { classroomService } from "../../services/classroomService";
import { toAbsoluteFileUrl } from "../../services/messagingService";

export type ClassroomRoadmapResourceData = {
  classroomRoadmapResourceId: number;
  classroomId: number;
  resourceType: "Pdf" | "ExternalLink";
  fileUrl?: string | null;
  fileName?: string | null;
  externalUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ClassroomRoadmapResourceSectionProps = {
  programId: number;
  isMentor?: boolean;
  resource: ClassroomRoadmapResourceData;
  onReplace?: () => void;
  onResourceChanged: () => Promise<void> | void;
};

const ClassroomRoadmapResourceSection = ({
  programId,
  isMentor = false,
  resource,
  onReplace,
  onResourceChanged,
}: ClassroomRoadmapResourceSectionProps) => {
  const resolveFileUrl = (fileUrl?: string | null) => {
    if (!fileUrl?.trim()) {
      return null;
    }

    return toAbsoluteFileUrl(fileUrl);
  };

  const handleOpenPdf = (fileUrl?: string | null) => {
    const resolved = resolveFileUrl(fileUrl);
    if (resolved) {
      window.open(resolved, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadPdf = (fileUrl?: string | null, fileName?: string | null) => {
    const resolved = resolveFileUrl(fileUrl);
    if (!resolved) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = resolved;
    anchor.download = fileName?.trim() || "roadmap.pdf";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleOpenLink = (url?: string | null) => {
    if (!url?.trim()) {
      return;
    }

    window.open(url.trim(), "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Remove this classroom roadmap resource?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await classroomService.deleteClassroomRoadmapResource(programId);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to remove resource.");
      }

      toast.success("Classroom roadmap resource removed.");
      await onResourceChanged();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to remove resource."
      );
    }
  };

  return (
    <section className="rounded-2xl border border-[#E6E9F2] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1F2432]">
            Classroom Reference Roadmap
          </h3>
          <p className="mt-1 text-sm text-[#667085]">
            A standalone PDF or link shared for this classroom.
          </p>
        </div>

        {isMentor && (
          <div className="flex flex-wrap gap-2">
            {onReplace && (
              <button
                type="button"
                onClick={onReplace}
                className="inline-flex items-center gap-2 rounded-xl border border-[#CFC7FF] bg-[#F5F3FF] px-4 py-2 text-sm font-semibold text-[#5E4BC5] transition hover:bg-[#EDE9FF]"
              >
                Replace
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-[#F2C6C6] bg-[#FFF5F5] px-4 py-2 text-sm font-semibold text-[#C0392B] transition hover:bg-[#FFECEC]"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-[#EEF0F6] bg-[#F9FAFC] p-5">
        {resource.resourceType === "Pdf" ? (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1F2432]">
              <FileText className="h-4 w-4 text-[#5E4BC5]" />
              Roadmap PDF
            </div>
            <p className="mt-2 text-sm text-[#4D5670]">
              {resource.fileName || "Uploaded PDF"}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleOpenPdf(resource.fileUrl)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5E4BC5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4F3DB0]"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDownloadPdf(resource.fileUrl, resource.fileName)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-[#D6DBE8] bg-white px-4 py-2 text-sm font-semibold text-[#4D5670] transition hover:bg-[#F7F8FB]"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1F2432]">
              <ExternalLink className="h-4 w-4 text-[#5E4BC5]" />
              External Roadmap
            </div>
            <p className="mt-2 break-all text-sm text-[#4D5670]">
              {resource.externalUrl}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleOpenLink(resource.externalUrl)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5E4BC5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4F3DB0]"
              >
                <ExternalLink className="h-4 w-4" />
                Open Link
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ClassroomRoadmapResourceSection;
