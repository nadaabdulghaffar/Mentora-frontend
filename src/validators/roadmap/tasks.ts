import type { LocalTask } from "../../types/roadmap";

import {
  isNonEmptyText,
} from "./text";

export type TaskFieldErrors =
  Partial<{
    title: string;
    description: string;
    deadline: string;
    attachmentUrl: string;
  }>;

export function validateTaskInput(
  task: Partial<
    Omit<
      LocalTask,
      "_localId" | "id"
    >
  >
): TaskFieldErrors | null {

  const errors: TaskFieldErrors = {};

  /* =========================
     title
  ========================= */

  if (
    !isNonEmptyText(
      task.title ?? ""
    )
  ) {

    errors.title =
      "Task needs a title.";
  }

  /* =========================
     description
  ========================= */

  if (
    !isNonEmptyText(
      task.description ?? ""
    )
  ) {

    errors.description =
      "Task description is required.";
  }

  /* =========================
     deadline
  ========================= */

  if (task.deadline) {

    const deadlineDate =
      new Date(
        task.deadline as string
      );

    if (
      Number.isNaN(
        deadlineDate.getTime()
      )
    ) {

      errors.deadline =
        "Task deadline must be a valid date.";

    } else if (
      deadlineDate <= new Date()
    ) {

      errors.deadline =
        "Task deadline must be in the future.";
    }
  }

  /* =========================
     attachment
  ========================= */

  /**
   * optional
   * upload endpoint may return:
   * - relative path
   * - full url
   */

  if (
    task.attachmentUrl &&
    typeof task.attachmentUrl !==
      "string"
  ) {

    errors.attachmentUrl =
      "Invalid attachment.";
  }

  return Object.keys(errors)
    .length > 0
      ? errors
      : null;
}

export function taskLimitReachedMessage(): string {

  return `
    Add as many tasks
    as needed for this topic.
  `;
}