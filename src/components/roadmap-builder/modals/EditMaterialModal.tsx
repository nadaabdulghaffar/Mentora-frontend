import { useEffect, useState } from "react";

import {
  File,
  FileText,
  Video,
} from "lucide-react";

import ModalBase from "../shared/ModalBase";

import type {
  LocalMaterial,
  MaterialType,
} from "../../../types/roadmap";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

interface Props {
  open: boolean;
  onClose: () => void;
  material: LocalMaterial | null;
  phaseId: string;
  topicId: string;
}

export default function EditMaterialModal({
  open,
  onClose,
  material,
  phaseId,
  topicId,
}: Props) {
  const updateMaterial = useRoadmapBuilderStore(
    (state) => state.updateMaterial
  );

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [materialType, setMaterialType] =
    useState<MaterialType>("article");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!material) return;
    setTitle(material.title);
    setUrl(material.url || "");
    setMaterialType(material.materialType);
  }, [material]);

  const getIcon = () => {
    switch (materialType) {
      case "article":
        return <FileText size={18} />;
      case "video":
        return <Video size={18} />;
      case "pdf":
        return <File size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  const handleSave = async () => {
    if (!material || !title.trim()) return;

    setSaving(true);
    await updateMaterial(
      phaseId,
      topicId,
      material._localId,
      { title, url, materialType }
    );
    setSaving(false);
    const hadError = !!useRoadmapBuilderStore.getState().error;
    if (!hadError) onClose();
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Edit Material"
      maxWidth="max-w-[680px]"
    >
      <div className="space-y-5">
        {/* type + title */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* type */}
          <div>
            <label
              className="
                block text-xs font-bold
                tracking-wide
                text-[#475467]
                mb-2
              "
            >
              TYPE
            </label>

            <div className="relative">
              <select
                value={materialType}
                onChange={(e) =>
                  setMaterialType(e.target.value as MaterialType)
                }
                className="
                  w-full h-12 rounded-2xl
                  bg-[#F3F5F9]
                  px-4 outline-none
                  appearance-none
                "
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>

              <div
                className="
                  absolute right-4 top-1/2
                  -translate-y-1/2
                  text-primary
                "
              >
                {getIcon()}
              </div>
            </div>
          </div>

          {/* title */}
          <div className="md:col-span-2">
            <label
              className="
                block text-xs font-bold
                tracking-wide
                text-[#475467]
                mb-2
              "
            >
              TITLE
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Material title"
              className="
                w-full h-12 rounded-2xl
                bg-[#F3F5F9]
                px-4 outline-none
              "
            />
          </div>
        </div>

        {/* url */}
        <div>
          <label
            className="
              block text-xs font-bold
              tracking-wide
              text-[#475467]
              mb-2
            "
          >
            LINK
          </label>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="
              w-full h-12 rounded-2xl
              bg-[#F3F5F9]
              px-4 outline-none
            "
          />
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