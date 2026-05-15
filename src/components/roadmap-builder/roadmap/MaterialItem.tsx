import { useState } from "react";

import {
  Pencil,
  Trash2,
  FileText,
  Video,
  File,
} from "lucide-react";

import type { LocalMaterial } from "../../../types/roadmap";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

import EditMaterialModal from "../modals/EditMaterialModal";

interface Props {
  material: LocalMaterial;

  phaseId: string;

  topicId: string;
}

export default function MaterialItem({
  material,
  phaseId,
  topicId,
}: Props) {
  const mode = useRoadmapBuilderStore((s) => s.mode);
  const readonly = mode === "view";

  const deleteMaterial =
    useRoadmapBuilderStore(
      (state) =>
        state.deleteMaterial
    );

  const [openEdit, setOpenEdit] =
    useState(false);

  const getIcon = () => {
    switch (
      material.materialType
    ) {
      case "article":
        return (
          <FileText
            size={18}
          />
        );

      case "video":
        return (
          <Video size={18} />
        );

      case "pdf":
        return (
          <File size={18} />
        );

      default:
        return (
          <FileText
            size={18}
          />
        );
    }
  };

  const getTypeLabel = () => {
    switch (
      material.materialType
    ) {
      case "article":
        return "Article";

      case "video":
        return "Video";

      case "pdf":
        return "PDF";

      default:
        return "Material";
    }
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
          <div className="text-[#98A2B3] shrink-0">
            {getIcon()}
          </div>

          <p
            className="
              text-[15px]
              text-[#1F2432]
              truncate
            "
          >
            {material.title} (
            {getTypeLabel()})
          </p>
        </div>

        {/* actions */}
        {!readonly && (
          <div className="flex items-center gap-3 shrink-0">
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
                deleteMaterial(
                  phaseId,
                  topicId,
                  material._localId
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
          </div>
        )}
      </div>

      {!readonly && (
        <EditMaterialModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          material={material}
          phaseId={phaseId}
          topicId={topicId}
        />
      )}
    </>
  );
}