import type { LocalPhase } from "../../types/roadmap";
import { isNonEmptyText, isValidUrl, normalizeText } from "./text";

/**
 * Full content validation before save draft / persist.
 * Matches backend expectations for titles, uniqueness, materials URLs, and task data.
 */
export function validateContentForSave(
  phases: LocalPhase[]
): string[] {
  const issues: string[] = [];

  const phaseTitleSeen = new Set<string>();
  for (const phase of phases) {
    if (!isNonEmptyText(phase.title)) {
      issues.push("Every phase needs a title.");
    } else {
      const key = normalizeText(phase.title).toLowerCase();
      if (phaseTitleSeen.has(key)) {
        issues.push("Phase titles must be unique within this roadmap.");
      }
      phaseTitleSeen.add(key);
    }
  }

  const topicTitleSeen = new Set<string>();
  for (const phase of phases) {
    for (const topic of phase.topics) {
      if (!isNonEmptyText(topic.title)) {
        issues.push("Every topic needs a title.");
      } else {
        const key = normalizeText(topic.title).toLowerCase();
        if (topicTitleSeen.has(key)) {
          issues.push("Topic titles must be unique across the whole roadmap.");
        }
        topicTitleSeen.add(key);
      }

const taskTitleSeen = new Set<string>();

for (const task of topic.tasks) {

  if (!isNonEmptyText(task.title)) {

    issues.push(
      `Task under “${topic.title}” needs a title.`
    );

  } else {

    const key =
      normalizeText(task.title)
        .toLowerCase();

    if (taskTitleSeen.has(key)) {

      issues.push(
        `Duplicate task titles are not allowed within “${topic.title}”.`
      );
    }

    taskTitleSeen.add(key);
  }

  if (
    !isNonEmptyText(
      task.description
    )
  ) {

    issues.push(
      `Task “${
        task.title || "Untitled"
      }” in “${
        topic.title
      }” needs a description.`
    );
  }

  if (task.deadline) {

    const deadline =
      new Date(task.deadline);

    if (
      Number.isNaN(
        deadline.getTime()
      )
    ) {

      issues.push(
        `Task “${
          task.title || "Untitled"
        }” has an invalid deadline.`
      );

    } else if (
      deadline <= new Date()
    ) {

      issues.push(
        `Task “${
          task.title || "Untitled"
        }” deadline must be in the future.`
      );
    }
  }

  /**
   * attachment optional
   * upload endpoint may return:
   * - relative path
   * - full url
   */

  if (
    task.attachmentUrl &&
    typeof task.attachmentUrl !==
      "string"
  ) {

    issues.push(
      `Task "${
        task.title || "Untitled"
      }" in "${
        topic.title
      }" has an invalid attachment.`
    );
  }
}

      const matTitleSeen = new Set<string>();
      for (const mat of topic.materials) {
        if (!isNonEmptyText(mat.title)) {
          issues.push(`Each material in “${topic.title}” needs a title.`);
        } else {
          const key = normalizeText(mat.title).toLowerCase();
          if (matTitleSeen.has(key)) {
            issues.push(
              `Material titles must be unique within “${topic.title}”.`
            );
          }
          matTitleSeen.add(key);
        }
        if (!isNonEmptyText(mat.url)) {
          issues.push(`Each material in “${topic.title}” needs a link.`);
        } else if (!isValidUrl(mat.url)) {
          issues.push(
            `Material links in “${topic.title}” must be valid http(s) URLs.`
          );
        }
        if (!mat.materialType) {
          issues.push(`Pick a type for each material in “${topic.title}”.`);
        }
      }
    }
  }

  return Array.from(new Set(issues));
}
