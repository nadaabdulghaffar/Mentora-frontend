import { useEffect, useState } from "react";

import {
  FileText,
  File,
  Video,
  Plus,
  X,
} from "lucide-react";

import ModalBase from "../shared/ModalBase";

import { useRoadmapBuilderStore } from "../../../store/roadmapBuilderStore";

import { validateMaterialInput } from "../../../validators/roadmap/index";

import type {
  MaterialType,
} from "../../../types/roadmap";

interface Props {
  open: boolean;
  onClose: () => void;
  phaseId: string;
  topicId: string;
}

interface MaterialFormRow {
  id: string;
  title: string;
  url: string;
  materialType: MaterialType;
}

export default function AddMaterialModal({
  open,
  onClose,
  phaseId,
  topicId,
}: Props) {

  const addMaterials =
    useRoadmapBuilderStore(
      (state) => state.addMaterials
    );

  const [rows, setRows] =
    useState<MaterialFormRow[]>([
      {
        id: crypto.randomUUID(),
        title: "",
        url: "",
        materialType: "article",
      },
    ]);

  const [saving, setSaving] =
    useState(false);

  const [rowErrors, setRowErrors] =
    useState<
      Record<
        string,
        Partial<{
          title: string;
          url: string;
        }>
      >
    >({});

  const handleChange = (
    rowId: string,
    key: keyof MaterialFormRow,
    value: string
  ) => {

    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    );

    if (rowErrors[rowId]) {

      setRowErrors((prev) => {

        const next = {
          ...prev,
        };

        if (next[rowId]) {
          delete next[rowId][
            key as keyof typeof next[string]
          ];
        }

        return next;
      });
    }
  };

  useEffect(() => {

    if (open) {

      setRows([
        {
          id: crypto.randomUUID(),
          title: "",
          url: "",
          materialType: "article",
        },
      ]);

      setRowErrors({});
    }

  }, [open]);

  const addAnother = () => {

    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        url: "",
        materialType: "article",
      },
    ]);
  };

  const removeRow = (
    rowId: string
  ) => {

    setRows((prev) =>
      prev.filter(
        (row) => row.id !== rowId
      )
    );
  };

  const getIcon = (
    type: MaterialType
  ) => {

    switch (type) {

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

    const newErrors:
      Record<
        string,
        Partial<{
          title: string;
          url: string;
        }>
      > = {};

    for (const row of rows) {

      const err =
        validateMaterialInput({
          title: row.title,
          url: row.url,
          materialType:
            row.materialType,
        });

      if (err) {
        newErrors[row.id] = err;
      }
    }

    if (
      Object.keys(newErrors)
        .length > 0
    ) {

      setRowErrors(newErrors);

      return;
    }

    setRowErrors({});

    setSaving(true);

    await addMaterials(
      phaseId,
      topicId,
      rows.map((row) => ({
        title: row.title,
        url: row.url,
        materialType:
          row.materialType,
      }))
    );

    setSaving(false);

    const hadError =
      !!useRoadmapBuilderStore
        .getState()
        .error;

    if (!hadError) {

      setRows([
        {
          id: crypto.randomUUID(),
          title: "",
          url: "",
          materialType: "article",
        },
      ]);

      setRowErrors({});

      onClose();
    }
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Add Materials"
      maxWidth="max-w-[760px]"
    >

      <div className="space-y-6">

        {rows.map((row) => (

          <div
            key={row.id}
            className="
              relative
              border border-primary/10
              rounded-[28px]
              p-5
              bg-[#FCFCFD]
            "
          >

            {/* remove row */}
            {rows.length > 1 && (

              <button
                onClick={() =>
                  removeRow(row.id)
                }
                className="
                  absolute top-4 right-4
                  w-8 h-8 rounded-full
                  bg-[#FDECEC]
                  text-red-500
                  flex items-center
                  justify-center
                "
              >

                <X size={16} />

              </button>
            )}

            {/* top row */}
            <div
              className="
                grid grid-cols-1
                md:grid-cols-3
                gap-4
              "
            >

              {/* type */}
              <div>

                <label
                  className="
                    block text-xs
                    font-bold
                    tracking-wide
                    text-[#475467]
                    mb-2
                  "
                >
                  TYPE
                </label>

                <div className="relative">

                  <select
                    value={
                      row.materialType
                    }
                    onChange={(e) =>
                      handleChange(
                        row.id,
                        "materialType",
                        e.target.value
                      )
                    }
                    className="
                      w-full h-12
                      rounded-2xl
                      bg-[#F3F5F9]
                      px-4 outline-none
                      appearance-none
                    "
                  >

                    <option value="article">
                      Article
                    </option>

                    <option value="video">
                      Video
                    </option>

                    <option value="pdf">
                      PDF
                    </option>

                  </select>

                  <div
                    className="
                      absolute right-4
                      top-1/2
                      -translate-y-1/2
                      text-primary
                    "
                  >
                    {getIcon(
                      row.materialType
                    )}
                  </div>

                </div>

              </div>

              {/* title */}
              <div className="md:col-span-2">

                <label
                  className="
                    block text-xs
                    font-bold
                    tracking-wide
                    text-[#475467]
                    mb-2
                  "
                >
                  TITLE
                </label>

                <input
                  value={row.title}
                  onChange={(e) =>
                    handleChange(
                      row.id,
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="
                    e.g. Design Thinking Handbook
                  "
                  className="
                    w-full h-12
                    rounded-2xl
                    bg-[#F3F5F9]
                    px-4 outline-none
                  "
                />

                {rowErrors[row.id]
                  ?.title && (

                  <p
                    className="
                      mt-1 text-sm
                      text-red-600
                      font-medium
                    "
                  >
                    {
                      rowErrors[row.id]
                        ?.title
                    }
                  </p>
                )}

              </div>

            </div>

            {/* url */}
            <div className="mt-4">

              <label
                className="
                  block text-xs
                  font-bold
                  tracking-wide
                  text-[#475467]
                  mb-2
                "
              >
                LINK
              </label>

              <input
                value={row.url}
                onChange={(e) =>
                  handleChange(
                    row.id,
                    "url",
                    e.target.value
                  )
                }
                placeholder="https://..."
                className="
                  w-full h-12
                  rounded-2xl
                  bg-[#F3F5F9]
                  px-4 outline-none
                "
              />

              {rowErrors[row.id]
                ?.url && (

                <p
                  className="
                    mt-1 text-sm
                    text-red-600
                    font-medium
                  "
                >
                  {
                    rowErrors[row.id]
                      ?.url
                  }
                </p>
              )}

            </div>

          </div>
        ))}

        {/* add another */}
        <button
          onClick={addAnother}
          className="
            w-full h-[74px]
            rounded-[24px]
            border-2 border-dashed
            border-primary/20
            flex items-center
            justify-center
            gap-3
            text-primary
            font-semibold
            hover:bg-primary/5
            transition
          "
        >

          <Plus size={20} />

          Add Another

        </button>

        {/* footer */}
        <div
          className="
            flex items-center
            justify-end
            gap-4 pt-2
          "
        >

          <button
            onClick={onClose}
            className="
              h-11 px-6
              rounded-2xl
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
              h-12 px-7
              rounded-2xl
              bg-primary text-white
              font-semibold
              shadow-lg
              shadow-primary/20
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {saving
              ? "Saving…"
              : "Save All"}

          </button>

        </div>

      </div>

    </ModalBase>
  );
}