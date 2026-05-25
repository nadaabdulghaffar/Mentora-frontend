import type { BasicInfoFormData } from "../../types/roadmap";
import type { BasicInfoFieldErrors } from "./types";
import { EXPERIENCE_LEVEL_IDS } from "./constants";
import { isNonEmptyText } from "./text";

function isValidExperienceLevel(value: unknown): boolean {
  return (EXPERIENCE_LEVEL_IDS as readonly number[]).includes(Number(value));
}

export function validateBasicInfo(
  basicInfo: BasicInfoFormData
): BasicInfoFieldErrors {
  const errors: BasicInfoFieldErrors = {};

  if (!isNonEmptyText(basicInfo.title)) {
    errors.title = "Add a clear title so learners know what this roadmap covers.";
  }

  if (basicInfo.skillDomainId == null) {
    errors.skillDomainId = "Choose the primary domain.";
  }

  if (basicInfo.subDomainId == null) {
    errors.subDomainId = "Choose a sub-domain to refine the scope.";
  }

  if (basicInfo.duration == null || Number.isNaN(basicInfo.duration)) {
    errors.duration = "Enter the duration in weeks.";
  } else if (basicInfo.duration <= 0) {
    errors.duration = "Duration must be at least one week.";
  }

  if (!isNonEmptyText(basicInfo.description)) {
    errors.description = "Describe outcomes and who this roadmap is for.";
  }

  const from = basicInfo.targetLevelFrom;
  const to = basicInfo.targetLevelTo;

  if (from == null) {
    errors.targetLevelFrom = "Select the starting experience level.";
  } else if (!isValidExperienceLevel(from)) {
    errors.targetLevelFrom = "Pick a valid experience level from the list.";
  }

  if (to == null) {
    errors.targetLevelTo = "Select the target experience level.";
  } else if (!isValidExperienceLevel(to)) {
    errors.targetLevelTo = "Pick a valid experience level from the list.";
  }

  if (
    from != null &&
    to != null &&
    isValidExperienceLevel(from) &&
    isValidExperienceLevel(to) &&
    from > to
  ) {
    errors.targetLevelTo =
      "Target level must be the same as or higher than the starting level.";
  }

  return errors;
}
