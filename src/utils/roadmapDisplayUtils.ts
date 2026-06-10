import { getDomains, getSubDomains } from '../services/roadmapService';
import type { RoadmapDetailsDto } from '../types/roadmap';
import type { RoadmapListItem } from '../types/roadmap';

export type DomainNameMaps = {
  domainsById: Map<number, string>;
  subDomainsById: Map<number, string>;
};

const EMPTY_MAPS: DomainNameMaps = {
  domainsById: new Map(),
  subDomainsById: new Map(),
};

let cachedMaps: DomainNameMaps | null = null;
let mapsPromise: Promise<DomainNameMaps> | null = null;

export function formatRoadmapDuration(duration?: number | null): string {
  if (duration == null || !Number.isFinite(duration) || duration < 1) {
    return '';
  }

  const weeks = Math.round(duration);
  return weeks === 1 ? '1 week' : `${weeks} weeks`;
}

export function formatTargetLevel(level?: number | null): string {
  if (level == null) return '';
  switch (level) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Junior';
    case 3:
      return 'Mid';
    case 4:
      return 'Senior';
    default:
      return '';
  }
}


export async function loadRoadmapDomainNameMaps(): Promise<DomainNameMaps> {
  if (cachedMaps) {
    return cachedMaps;
  }

  if (!mapsPromise) {
    mapsPromise = (async () => {
      try {
        const domainsById = new Map<number, string>();
        const subDomainsById = new Map<number, string>();

        const domains = await getDomains();

        for (const domain of domains) {
          const domainId = Number(domain.id);
          if (!Number.isFinite(domainId)) continue;
          domainsById.set(domainId, domain.name);

          const subs = await getSubDomains(domainId);
          for (const sub of subs) {
            const subId = Number(sub.id);
            if (Number.isFinite(subId)) {
              subDomainsById.set(subId, sub.name);
            }
          }
        }

        cachedMaps = { domainsById, subDomainsById };
        return cachedMaps;
      } catch (error) {
        console.error('Failed to load roadmap domain lookups', error);
        return EMPTY_MAPS;
      }
    })();
  }

  return mapsPromise;
}

export function normalizeRoadmapDetailsDto(
  raw: Record<string, unknown>
): RoadmapDetailsDto & {
  skillDomainName?: string;
  subDomainName?: string;
} {
  const phases = raw.phases ?? raw.Phases;

  return {
    roadmapId: Number(raw.roadmapId ?? raw.RoadmapId ?? 0),
    title: String(raw.title ?? raw.Title ?? ''),
    description: String(raw.description ?? raw.Description ?? ''),
    duration: Number(raw.duration ?? raw.Duration ?? 0),
    skillDomainId: Number(raw.skillDomainId ?? raw.SkillDomainId ?? 0),
    subDomainId: Number(raw.subDomainId ?? raw.SubDomainId ?? 0),
    targetLevelFrom: (raw.targetLevelFrom ?? raw.TargetLevelFrom) as RoadmapDetailsDto['targetLevelFrom'],
    targetLevelTo: (raw.targetLevelTo ?? raw.TargetLevelTo) as RoadmapDetailsDto['targetLevelTo'],
    technologyIds: (raw.technologyIds ?? raw.TechnologyIds) as number[] | undefined,
    mentorProfileId: String(raw.mentorProfileId ?? raw.MentorProfileId ?? ''),
    phases: Array.isArray(phases) ? (phases as RoadmapDetailsDto['phases']) : [],
    skillDomainName: String(
      raw.skillDomainName ??
        raw.SkillDomainName ??
        raw.domainName ??
        raw.DomainName ??
        ''
    ).trim() || undefined,
    subDomainName: String(
      raw.subDomainName ?? raw.SubDomainName ?? ''
    ).trim() || undefined,
  };
}

export function normalizeRoadmapDetailsList(data: unknown): RoadmapDetailsDto[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data
      .map((item) =>
        typeof item === 'object' && item != null
          ? normalizeRoadmapDetailsDto(item as Record<string, unknown>)
          : null
      )
      .filter((item): item is RoadmapDetailsDto => item != null && item.roadmapId > 0);
  }

  if (typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const nested = record.data ?? record.Data;
    if (nested) {
      return normalizeRoadmapDetailsList(nested);
    }
  }

  return [];
}

export function resolveRoadmapMeta(
  skillDomainId: number | undefined,
  subDomainId: number | undefined,
  duration: number | undefined,
  maps: DomainNameMaps,
  preset?: { domainName?: string; subDomainName?: string }
): Pick<RoadmapListItem, 'domainName' | 'subDomainName' | 'duration'> {
  const domainName =
    preset?.domainName ||
    (skillDomainId != null ? maps.domainsById.get(skillDomainId) ?? '' : '');
  const subDomainName =
    preset?.subDomainName ||
    (subDomainId != null ? maps.subDomainsById.get(subDomainId) ?? '' : '');

  return {
    domainName: domainName || undefined,
    subDomainName: subDomainName || undefined,
    duration,
  };
}

export function roadmapDetailsToListItem(
  roadmap: RoadmapDetailsDto & {
    skillDomainName?: string;
    subDomainName?: string;
  },
  maps: DomainNameMaps
): RoadmapListItem {
  const extended = roadmap as RoadmapDetailsDto & {
    skillDomainName?: string;
    subDomainName?: string;
  };

  const meta = resolveRoadmapMeta(
    roadmap.skillDomainId,
    roadmap.subDomainId,
    roadmap.duration,
    maps,
    {
      domainName: extended.skillDomainName,
      subDomainName: extended.subDomainName,
    }
  );

  const phasesCount = Array.isArray(roadmap.phases) ? roadmap.phases.length : 0;

  return {
    roadmapId: roadmap.roadmapId,
    title: roadmap.title,
    description: roadmap.description,
    phasesCount,
    skillDomainId: roadmap.skillDomainId,
    domainId:
      roadmap.skillDomainId != null
        ? ((Math.max(1, roadmap.skillDomainId) - 1) % 4) + 1
        : 1,
    targetLevelFrom: roadmap.targetLevelFrom,
    targetLevelTo: roadmap.targetLevelTo,
    ...meta,
  };
}


export function exploreRoadmapToListItem(
  item: {
    roadmapId: number;
    title: string;
    description: string;
    skillDomainId: number;
    subDomainId: number;
    duration?: number;
    phasesCount: number;
    skillDomainName?: string;
    subDomainName?: string;
  },
  maps: DomainNameMaps
): RoadmapListItem {
  const meta = resolveRoadmapMeta(
    item.skillDomainId,
    item.subDomainId,
    item.duration,
    maps,
    {
      domainName: item.skillDomainName,
      subDomainName: item.subDomainName,
    }
  );

  return {
    roadmapId: item.roadmapId,
    title: item.title,
    description: item.description,
    phasesCount: item.phasesCount,
    skillDomainId: item.skillDomainId,
    domainId: ((Math.max(1, item.skillDomainId) - 1) % 4) + 1,
    ...meta,
  };
}
