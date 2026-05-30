import type {
  LocalMaterial,
} from "../../types/roadmap";

import {
  isNonEmptyText,
  isValidUrl,
  normalizeText,
} from "./text";

export type MaterialFieldErrors =
  Partial<{
    title: string;
    url: string;
    materialType: string;
  }>;

export function validateMaterialInput(
  material: Omit<
    LocalMaterial,
    "_localId" | "id"
  >
): MaterialFieldErrors | null {

  const errors:
    MaterialFieldErrors = {};

  /* =========================
     title
  ========================= */

  if (
    !isNonEmptyText(
      material.title
    )
  ) {

    errors.title =
      "Give this material a short title.";
  }

  /* =========================
     url
  ========================= */

  if (
    !isNonEmptyText(
      material.url
    )
  ) {

    errors.url =
      "Add a link to the resource.";

  } else if (
    !isValidUrl(
      material.url
    )
  ) {

    errors.url =
      "Use a valid http(s) URL for the material link.";
  }

  /* =========================
     material type
  ========================= */

  if (
    !material.materialType
  ) {

    errors.materialType =
      "Choose a material type.";
  }

  return Object.keys(errors)
    .length > 0
      ? errors
      : null;
}

export function validateMaterialAttachmentUrl(
  url: string | undefined
): string | null {

  const t =
    normalizeText(url ?? "");

  if (!t) return null;

  if (!isValidUrl(t)) {

    return `
      Attachment must be
      a valid http(s) URL,
      or upload a file
      to fill this automatically.
    `;
  }

  return null;
}