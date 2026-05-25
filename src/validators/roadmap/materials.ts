import type { LocalMaterial } from "../../types/roadmap";
import { isNonEmptyText, isValidUrl, normalizeText } from "./text";

export function validateMaterialInput(
  material: Omit<LocalMaterial, "_localId" | "id">
): string | null {
  if (!isNonEmptyText(material.title)) {
    return "Give this material a short title.";
  }
  if (!isNonEmptyText(material.url)) {
    return "Add a link to the resource.";
  }
  if (!isValidUrl(material.url)) {
    return "Use a valid http(s) URL for the material link.";
  }
  if (!material.materialType) {
    return "Choose a material type (article, video, or PDF).";
  }
  return null;
}

export function validateMaterialAttachmentUrl(
  url: string | undefined
): string | null {
  const t = normalizeText(url ?? "");
  if (!t) return null;
  if (!isValidUrl(t)) {
    return "Attachment must be a valid http(s) URL, or upload a file to fill this automatically.";
  }
  return null;
}
