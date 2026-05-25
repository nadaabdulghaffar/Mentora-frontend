import { ROADMAP_STATUS, type RoadmapStatus } from "../../types/roadmap";

/** Backend `Topic` supports multiple tasks. */
export const MAX_TASKS_PER_TOPIC = Number.POSITIVE_INFINITY;

/** ExperienceLevel enum on API: None=1 … Advanced=4 */
export const EXPERIENCE_LEVEL_IDS = [1, 2, 3, 4] as const;

export function isPublishedStatus(
  status: RoadmapStatus | number | string | undefined | null
): boolean {
  if (status == null) return false;
  const n = Number(status);
  if (!Number.isNaN(n) && n === ROADMAP_STATUS.Published) return true;
  if (typeof status === "string" && status.toLowerCase() === "published")
    return true;
  return false;
}
