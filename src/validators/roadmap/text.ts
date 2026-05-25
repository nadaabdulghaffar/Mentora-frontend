export function normalizeText(value: string): string {
  return value.trim();
}

export function isNonEmptyText(value: string): boolean {
  return normalizeText(value).length > 0;
}

function normKey(value: string): string {
  return normalizeText(value).toLowerCase();
}

export function isValidUrl(value: string): boolean {
  const raw = normalizeText(value);
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasDuplicatePhaseTitle(
  phases: { _localId: string; title: string }[],
  candidateTitle: string,
  excludeLocalId?: string
): boolean {
  const key = normKey(candidateTitle);
  return phases.some(
    (p) => p._localId !== excludeLocalId && normKey(p.title) === key
  );
}

export function hasDuplicateTopicTitleAcrossRoadmap(
  phases: { _localId: string; topics: { _localId: string; title: string }[] }[],
  candidateTitle: string,
  exclude?: { phaseLocalId: string; topicLocalId: string }
): boolean {
  const key = normKey(candidateTitle);
  return phases.some((p) =>
    p.topics.some(
      (t) =>
        !(
          exclude &&
          exclude.phaseLocalId === p._localId &&
          exclude.topicLocalId === t._localId
        ) && normKey(t.title) === key
    )
  );
}

export function hasDuplicateMaterialTitleInTopic(
  topic: { materials: { _localId: string; title: string }[] },
  candidateTitle: string,
  excludeLocalId?: string
): boolean {
  const key = normKey(candidateTitle);
  return topic.materials.some(
    (m) => m._localId !== excludeLocalId && normKey(m.title) === key
  );
}
