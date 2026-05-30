import type { LocalPhase } from "../../types/roadmap";

/**
 * Publish gate — mirrors backend `PublishRoadmapAsync` structural checks
 * (phases, topics per phase, task + materials per topic).
 */
export function validatePublishStructure(
  phases: LocalPhase[]
): string[] {

  const issues: string[] = [];

  if (!phases.length) {
    issues.push(
      "Add at least one phase before publishing."
    );

    return issues;
  }

  for (const phase of phases) {

    if (!phase.topics.length) {

      issues.push(
        `Phase “${phase.title || "Untitled"}” needs at least one topic.`
      );
    }
  }

  return dedupeIssues(issues);
}

function dedupeIssues(issues: string[]): string[] {
  return Array.from(new Set(issues));
}
