import type { LocalTask } from "../../types/roadmap";
import { isNonEmptyText, isValidUrl, normalizeText } from "./text";

export type TaskFieldErrors = Partial<{
  title: string;
  description: string;
  deadline: string;
  attachmentUrl: string;
}>;

export function validateTaskInput(
  task: Partial<Omit<LocalTask, "_localId" | "id">>
): TaskFieldErrors | null {
  const errors: TaskFieldErrors = {};

  if (!isNonEmptyText(task.title ?? "")) {
    errors.title = "Task needs a title.";
  }
  if (!isNonEmptyText(task.description ?? "")) {
    errors.description = "Task description is required.";
  }
  if (task.deadline) {
    const deadlineDate = new Date(task.deadline as string);
    if (Number.isNaN(deadlineDate.getTime())) {
      errors.deadline = "Task deadline must be a valid date.";
    } else if (deadlineDate <= new Date()) {
      errors.deadline = "Task deadline must be in the future.";
    }
  }
  const normalized = normalizeText(task.attachmentUrl ?? "");
  if (!normalized) {
    errors.attachmentUrl = "Attachment URL is required.";
  } else if (!isValidUrl(normalized)) {
    errors.attachmentUrl = "Attachment URL must be a valid http(s) URL.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function taskLimitReachedMessage(): string {
  return `Add as many tasks as needed for this topic.`;
}
