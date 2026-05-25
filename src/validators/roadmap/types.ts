/**
 * Shared types for roadmap validation (aligned with backend rules we mirror in UI).
 */

export type BasicInfoFieldErrors = Partial<
  Record<
    | "title"
    | "skillDomainId"
    | "subDomainId"
    | "duration"
    | "description"
    | "targetLevelFrom"
    | "targetLevelTo",
    string
  >
>;

export type RoadmapValidationSeverity = "error" | "warning";

export interface RoadmapValidationIssue {
  code: string;
  message: string;
  severity: RoadmapValidationSeverity;
}
