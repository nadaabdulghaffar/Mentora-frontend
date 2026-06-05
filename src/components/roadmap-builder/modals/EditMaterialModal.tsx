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
  readOnly?: boolean;
}

export default function EditMaterialModal({
  open,
  onClose,
  material,
  phaseId,
  topicId,
  readOnly = false,
}: Props) {
  const updateMaterial = useRoadmapBuilderStore(
    (state) => state.updateMaterial
  );

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [materialType, setMaterialType] =
    useState<MaterialType>("article");
  const [linkError, setLinkError] = useState("");

  const [originalTitle, setOriginalTitle] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalMaterialType, setOriginalMaterialType] =
    useState<MaterialType>("article");

  useEffect(() => {
    if (!material) return;

    setTitle(material.title);
    setUrl(material.url || "");
    setMaterialType(material.materialType);

    setOriginalTitle(material.title);
    setOriginalUrl(material.url || "");
    setOriginalMaterialType(material.materialType);

    setLinkError("");
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

  const handleSaveChanges = async () => {
    if (!material) return;

    if (!title.trim()) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setLinkError("Link is required");
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        setLinkError(
          "Please enter a valid link starting with http:// or https://"
        );
        return;
      }
    } catch {
      setLinkError(
        "Please enter a valid link starting with http:// or https://"
      );
      return;
    }

    setLinkError("");

    await updateMaterial(
      phaseId,
      topicId,
      material._localId,
      {
        title: title.trim(),
        url: trimmedUrl,
        materialType,
      }
    );

    onClose();
  };

  const revertAndClose = async () => {
    if (material) {
      await updateMaterial(
        phaseId,
        topicId,
        material._localId,
        {
          title: originalTitle,
          url: originalUrl,
          materialType: originalMaterialType,
        }
      );
    }

    onClose();
  };

  return (
   <ModalBase
  open={open}
  onClose={onClose}
  title={
    readOnly
      ? "Material Details"
      : "Edit Material"
  }
  maxWidth="max-w-[680px]"
>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  disabled={readOnly}
                 value={materialType}
                 onChange={(e) =>
                  setMaterialType(
                   e.target.value as MaterialType
                         )
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
            
              disabled={readOnly}
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

  {readOnly ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block
        w-full
        rounded-2xl
        bg-[#F3F5F9]
        px-4 py-3
        text-primary
        underline
        break-all
      "
    >
      {url}
    </a>
  ) : (
    <input
      value={url}
      onChange={(e) => {
        setUrl(e.target.value);
        setLinkError("");
      }}
      placeholder="https://..."
      type="url"
      className="
        w-full h-12 rounded-2xl
        bg-[#F3F5F9]
        px-4 outline-none
      "
    />
  )}

  {linkError && (
    <p className="mt-2 text-sm font-medium text-red-600">
      {linkError}
    </p>
  )}
</div>

       <div className="flex justify-end gap-4 pt-2">

  {readOnly ? (
    <button
      onClick={onClose}
      className="
        h-11 px-6 rounded-2xl
        bg-primary
        text-white
        font-medium
      "
    >
      Close
    </button>
  ) : (
    <>
      <button
        onClick={() => {
          void revertAndClose();
        }}
        className="
          h-11 px-6 rounded-2xl
          text-[#344054]
          font-medium
        "
      >
        Cancel
      </button>

      <button
        onClick={() => {
          void handleSaveChanges();
        }}
        className="
          h-11 px-6 rounded-2xl
          bg-primary
          text-white
          font-medium
        "
      >
        Save Changes
      </button>
    </>
  )}

</div> 
</div>  {/* space-y-5 */}
</ModalBase>
  );
}
