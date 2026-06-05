import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmbeddedRoadmapStructure from "../roadmap-builder/EmbeddedRoadmapStructure";

import { useRoadmapBuilderStore } from "../../store/roadmapBuilderStore";
import {
  createRoadmapBasicInfo,
  publishRoadmap,
  updateRoadmap,
  uploadTaskAttachment,
} from "../../services/roadmapService";
import { classroomService } from "../../services/classroomService";

type ClassroomRoadmapSectionProps = {
  roadmapId?: number | null;
  programId: number;
  isMentor?: boolean;
  onRoadmapAttached?: (roadmapId: number) => void;
};

const ClassroomRoadmapSection = ({
  roadmapId,
  programId,
  isMentor = false,
  onRoadmapAttached,
}: ClassroomRoadmapSectionProps) => {

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const loadForView =
    useRoadmapBuilderStore(
      (s) => s.loadForView
    );

  const phases =
    useRoadmapBuilderStore(
      (s) => s.phases
    );

    useEffect(() => {

  console.log(
    "ROADMAP PHASES UPDATED:",
    phases
  );

}, [phases]);

    const collapseAll =
  useRoadmapBuilderStore(
    (s) => s.collapseAll
  );

const expandAll =
  useRoadmapBuilderStore(
    (s) => s.expandAll
  );


  const isLoading =
    useRoadmapBuilderStore(
      (s) => s.isSaving
    );

  const error =
    useRoadmapBuilderStore(
      (s) => s.error
    );

  const toNumber = (value: unknown, fallback = 0) => {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : fallback;
  };

  const normalizeMaterialType = (value: unknown): number => {
    if (value === 2 || value === "video") return 2;
    if (value === 3 || value === "pdf") return 3;
    return 1;
  };

  const parseImportedRoadmap = (raw: unknown) => {
    const payload =
      raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)
        ? (raw as { data?: unknown }).data
        : raw;

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid roadmap file format.");
    }

    const source = payload as Record<string, any>;
    const phasesSource = Array.isArray(source.phases) ? source.phases : [];

    if (!phasesSource.length) {
      throw new Error("Roadmap file must include at least one phase.");
    }

    const skillDomainId = toNumber(source.skillDomainId);
    const subDomainId = toNumber(source.subDomainId);

    if (!skillDomainId || !subDomainId) {
      throw new Error("Roadmap file must include valid skillDomainId and subDomainId.");
    }

    const basicInfo = {
      title: String(source.title ?? "Imported roadmap").trim() || "Imported roadmap",
      description: String(source.description ?? "Imported from JSON file").trim() || "Imported from JSON file",
      duration: Math.max(1, toNumber(source.duration, 1)),
      skillDomainId,
      subDomainId,
      targetLevelFrom: source.targetLevelFrom ?? null,
      targetLevelTo: source.targetLevelTo ?? null,
      technologyIds: Array.isArray(source.technologyIds)
        ? source.technologyIds.map((value: unknown) => toNumber(value)).filter((value: number) => value > 0)
        : [],
    };

    const contentPayload = {
      title: basicInfo.title,
      description: basicInfo.description,
      duration: basicInfo.duration,
      targetLevelFrom: basicInfo.targetLevelFrom,
      targetLevelTo: basicInfo.targetLevelTo,
      technologyIds: basicInfo.technologyIds,
      phases: phasesSource.map((phase: any, phaseIndex: number) => ({
        title: String(phase?.title ?? `Phase ${phaseIndex + 1}`),
        summary: String(phase?.summary ?? ""),
        order: toNumber(phase?.order, phaseIndex + 1),
        topics: (Array.isArray(phase?.topics) ? phase.topics : []).map((topic: any, topicIndex: number) => ({
          title: String(topic?.title ?? `Topic ${topicIndex + 1}`),
          summary: String(topic?.summary ?? ""),
          order: toNumber(topic?.order, topicIndex + 1),
          materials: (Array.isArray(topic?.materials) ? topic.materials : []).map((material: any) => ({
            title: String(material?.title ?? "Material"),
            url: String(material?.url ?? ""),
            materialType: normalizeMaterialType(material?.materialType),
          })),
          tasks: [
            ...(Array.isArray(topic?.tasks) ? topic.tasks : []),
            ...(topic?.topicTask ? [topic.topicTask] : []),
          ].map((task: any) => ({
            title: String(task?.title ?? "Task"),
            description: String(task?.description ?? ""),
            deadLine: task?.deadline ?? task?.deadLine ?? null,
            attachmentUrl: String(task?.attachmentUrl ?? "").trim(),
          })),
        })),
      })),
    };

    return { basicInfo, contentPayload };
  };

  const readFileAsText = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsText(file);
    });

  const handleRoadmapFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadError(null);
      setUploadSuccess(null);
      setIsUploading(true);

      // If the file looks like JSON, try to parse as a roadmap export
      const isJson = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");

      if (isJson) {
        const fileText = await readFileAsText(file);
        const parsed = JSON.parse(fileText);
        const { basicInfo, contentPayload } = parseImportedRoadmap(parsed);

        const newRoadmapId = await createRoadmapBasicInfo(basicInfo);
        await updateRoadmap(newRoadmapId, contentPayload as any);
        await publishRoadmap(newRoadmapId);
        await classroomService.attachRoadmapToProgram(programId, newRoadmapId);
        await loadForView(newRoadmapId);

        onRoadmapAttached?.(newRoadmapId);
        setUploadSuccess("Roadmap uploaded and linked to this classroom successfully.");
      } else {
        // For PDF/DOC/XLSX or other binary files: upload file and create a minimal roadmap
        const uploadedUrl = await uploadTaskAttachment(file);

        const fileTitle = file.name.replace(/\.[^/.]+$/, "");
        const basicInfo = {
          title: fileTitle || "Imported file",
          description: `Imported file: ${file.name}`,
          duration: 1,
          // Fallback domain/subdomain — consider prompting user later
          skillDomainId: 1,
          subDomainId: 1,
          targetLevelFrom: null,
          targetLevelTo: null,
          technologyIds: [],
        };

        const contentPayload = {
          title: basicInfo.title,
          description: basicInfo.description,
          duration: basicInfo.duration,
          targetLevelFrom: null,
          targetLevelTo: null,
          technologyIds: [],
          phases: [
            {
              title: "Imported Files",
              summary: "Files attached by mentor",
              order: 1,
              topics: [
                {
                  title: "Files",
                  summary: "",
                  order: 1,
                  materials: [
                    {
                      title: file.name,
                      url: uploadedUrl,
                      materialType: 3,
                    },
                  ],
                  tasks: [],
                },
              ],
            },
          ],
        };

        const newRoadmapId = await createRoadmapBasicInfo(basicInfo);
        await updateRoadmap(newRoadmapId, contentPayload as any);
        await publishRoadmap(newRoadmapId);
        await classroomService.attachRoadmapToProgram(programId, newRoadmapId);
        await loadForView(newRoadmapId);

        onRoadmapAttached?.(newRoadmapId);
        setUploadSuccess("File uploaded and attached as a minimal roadmap.");
      }
    } catch (uploadErr: any) {
      setUploadError(
        uploadErr?.response?.data?.message ||
          uploadErr?.message ||
          "Failed to upload and link roadmap."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // roadmap loading is handled at the page level (ClassroomPageRefactored)

  if (!roadmapId) {

    return (
      <section className="space-y-5">

        <div
          className="
            rounded-2xl
            border border-dashed
            border-[#D7DBE7]
            bg-white
            p-10
            text-center
          "
        >

          <h3
            className="
              text-lg
              font-semibold
              text-[#1F2432]
            "
          >
            No roadmap attached yet
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-[#667085]
            "
          >
            This classroom does not
            have a roadmap linked yet.
          </p>

          {isMentor && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/roadmap/create?programId=${programId}&returnTo=${encodeURIComponent(`/classroom/${programId}`)}`
                  )
                }
                className="rounded-xl bg-[#5E4BC5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F3DB0]"
              >
                Create your roadmap
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-[#CFC7FF] bg-white px-5 py-3 text-sm font-semibold text-[#5E4BC5] transition hover:bg-[#F5F3FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? "Uploading..." : "Upload your roadmap"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={handleRoadmapFileSelected}
              />
            </div>
          )}

          {uploadError && (
            <p className="mt-4 text-sm font-medium text-red-600">{uploadError}</p>
          )}

          {uploadSuccess && (
            <p className="mt-4 text-sm font-medium text-green-600">{uploadSuccess}</p>
          )}

        </div>

        

      </section>
    );
  }

  return (

    <section className="space-y-5">

      <div
        className="
          flex items-center
          justify-between
          gap-4
          flex-wrap
        "
      >

        <div>

          <h2
            className="
              text-2xl
              font-bold
              text-[#1F2432]
            "
          >
            Learning Roadmap
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-[#667085]
            "
          >
            Follow the roadmap structure
            and complete the required tasks.
          </p>

        </div>
        

        {isMentor && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/roadmap/${roadmapId}/edit`

              )
            }
            className="
              rounded-xl
              bg-[#5E4BC5]
              px-5 py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#4F3DB0]
            "
          >
            Edit Roadmap
          </button>
        )}

      </div>
<div
  className="
    flex items-center
    justify-between
    gap-4
    flex-wrap
  "
>

  <h3
    className="
      text-lg
      font-semibold
      text-[#1F2432]
    "
  >
  </h3>

  <div
    className="
      flex items-center
      gap-3
    "
  >

    <button
      onClick={expandAll}
      className="
        text-[#5E4BC5]
        text-sm
        font-semibold
        hover:opacity-80
        transition
      "
    >
      Expand All
    </button>

    <span
      className="
        text-[#D0D5DD]
      "
    >
      |
    </span>

    <button
      onClick={collapseAll}
      className="
        text-[#5E4BC5]
        text-sm
        font-semibold
        hover:opacity-80
        transition
      "
    >
      Collapse All
    </button>

  </div>

</div>
      {isLoading ? (

        <div
          className="
            rounded-2xl
            bg-white
            p-10
            text-center
            text-[#667085]
          "
        >
          Loading roadmap...
        </div>

      ) : error ? (

        <div
          className="
            rounded-2xl
            bg-white
            p-6
            text-sm
            font-medium
            text-red-600
          "
        >
          {error}
        </div>

      ) : (

        <EmbeddedRoadmapStructure
          phases={phases}
        />

      )}

    </section>
  );
};

export default ClassroomRoadmapSection;