import type { ApiResponse } from "./api";

export type { ApiResponse };

export interface LookupItem {
  id: number;
  name: string;
}

export type MaterialType = "article" | "video" | "pdf";

export const MATERIAL_TYPE_MAP = {
  article: 1,
  video: 2,
  pdf: 3,
} as const;

export const ROADMAP_STATUS = {
  Draft: "draft",
  Published: "published",
  Archived: "archived",
} as const;

export type RoadmapStatus =
  (typeof ROADMAP_STATUS)[keyof typeof ROADMAP_STATUS];

export function normalizeRoadmapStatus(
  status?: string | null
): RoadmapStatus {
  const normalized = status?.trim().toLowerCase();

  if (!normalized) {
    return ROADMAP_STATUS.Draft;
  }

  if (normalized.includes("publish")) {
    return ROADMAP_STATUS.Published;
  }

  if (normalized.includes("archive")) {
    return ROADMAP_STATUS.Archived;
  }

  return ROADMAP_STATUS.Draft;
}

export interface CreateRoadmapBasicInfoRequest {
  title: string;
  description: string;
  duration: number;
  skillDomainId: number;
  subDomainId: number;
  targetLevelFrom?: number | null;
  targetLevelTo?: number | null;
}

export interface CreatePhaseRequest {
  title: string;
  summary: string;
  order: number;
}

export interface UpdatePhaseRequest extends CreatePhaseRequest {}

export interface CreateTopicRequest {
  title: string;
  summary: string;
  order: number;
  materials: MaterialPayload[];
  tasks: CreateTaskRequest[];
}

export interface UpdateTopicRequest {
  title: string;
  summary: string;
  order: number;
  materials: UpdateMaterialPayload[];
  topicTask: UpdateTaskRequest | null;
}

export interface MaterialPayload {
  title: string;
  url: string;
  materialType: MaterialType;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  deadline?: string | null;
  attachmentUrl?: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  deadLine?: string | null;
  attachmentUrl?: string | null;
}

export interface UpdateMaterialPayload {
  title: string;
  url: string;
  materialType: MaterialType;
}

export interface RoadmapTaskDto {
  taskId?: number;
  id?: number;
  title: string;
  description?: string | null;
  deadline?: string | null;
  deadLine?: string | null;
  attachmentUrl?: string | null;
}

export interface RoadmapMaterialDto {
  materialId?: number;
  id?: number;
  title: string;
  url?: string | null;
  materialType?: MaterialType | string | number;
}

export interface RoadmapTopicDto {
  topicId?: number;
  id?: number;
  title: string;
  summary?: string | null;
  order?: number;
  materials?: RoadmapMaterialDto[];
  topicTask?: RoadmapTaskDto | null;
  tasks?: RoadmapTaskDto[];
}

export interface RoadmapPhaseDto {
  phaseId?: number;
  id?: number;
  title: string;
  summary?: string | null;
  order?: number;
  topics?: RoadmapTopicDto[];
}

export interface RoadmapDetailsDto {
  roadmapId: number;
  title: string;
  description: string;
  duration: number;
  skillDomainId: number;
  subDomainId: number;
  targetLevelFrom?: number | null;
  targetLevelTo?: number | null;
  status?: string | null;
  technologyIds?: number[];
  phases: RoadmapPhaseDto[];
}

export interface RoadmapListItem {
  roadmapId: number;
  title: string;
  description: string;
  phasesCount: number;
  skillDomainId?: number;
  domainId?: number;
  status?: string;
}

export interface LocalMaterial {
  _localId: string;
  materialId?: number;
  title: string;
  url: string;
  materialType: MaterialType;
}

export interface LocalTask {
  _localId: string;
  taskId?: number;
  title: string;
  description: string;
  deadline?: string;
  attachmentUrl?: string;
}

export interface LocalTopic {
  _localId: string;
  topicId?: number;
  title: string;
  summary: string;
  order: number;
  materials: LocalMaterial[];
  tasks: LocalTask[];
}

export interface LocalPhase {
  _localId: string;
  phaseId?: number;
  title: string;
  summary: string;
  order: number;
  topics: LocalTopic[];
}
