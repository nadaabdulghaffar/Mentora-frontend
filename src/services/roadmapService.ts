import apiClient from "./api";

import type { FileUploadResponse } from "../types/api";

import type {
  ApiResponse,
  CreateRoadmapBasicInfoRequest,
  CreatePhaseRequest,
  UpdatePhaseRequest,
  CreateTopicRequest,
  UpdateTopicRequest,
  MaterialPayload,
  CreateTaskRequest,
  UpdateTaskRequest,
  LookupItem,
  MaterialType,
  RoadmapDetailsDto,
  
} from "../types/roadmap";

import {
  MATERIAL_TYPE_MAP as MAT_MAP,
} from "../types/roadmap";
import api from "./api";

/* =========================================
   ERROR HANDLER
========================================= */

export const extractErrorMessage = (
  error: any
): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    "Something went wrong"
  );
};

/** Roadmap endpoints return `ApiResponse<T>` in the JSON body; reject success=false or missing data. */
function unwrapRoadmapEnvelope<T>(
  body: ApiResponse<T> | undefined
): T {
  if (
    !body ||
    body.success !== true ||
    body.data === undefined ||
    body.data === null
  ) {
    const err = new Error(
      body?.message || "Roadmap request failed"
    ) as Error & { response?: { data: unknown } };
    err.response = { data: body };
    throw err;
  }
  return body.data;
}

/* =========================================
   NORMALIZERS  (lookup responses)
========================================= */

function normalizeDomain(raw: any): LookupItem {
  return { id: raw.domainId ?? raw.id, name: raw.name };
}

function normalizeSubDomain(raw: any): LookupItem {
  return { id: raw.subDomainId ?? raw.id, name: raw.name };
}

function normalizeExperienceLevel(raw: any): LookupItem {
  return { id: raw.value ?? raw.id, name: raw.name };
}

/* =========================================
   MATERIAL TYPE HELPERS
========================================= */

const MATERIAL_TYPE_REVERSE_MAP = {
  1: "article",
  2: "video",
  3: "pdf",
} as const;

export {
  MAT_MAP as MATERIAL_TYPE_MAP,
  MATERIAL_TYPE_REVERSE_MAP,
};

export function toBackendMaterialType(
  frontendType: MaterialType
): number {
  return MAT_MAP[frontendType];
}

/* =========================================
   LOOKUPS
========================================= */

export const getDomains =
  async (): Promise<LookupItem[]> => {
    const response =
      await apiClient.get<any[]>("/Lookup/domains");
    return response.data.map(normalizeDomain);
  };

export const getSubDomains =
  async (domainId: number): Promise<LookupItem[]> => {
    const response =
      await apiClient.get<any[]>(
        `/Lookup/domains/${domainId}/subdomains`
      );
    return response.data.map(normalizeSubDomain);
  };

export const getExperienceLevels =
  async (): Promise<LookupItem[]> => {
    const response =
      await apiClient.get<any[]>(
        "/Lookup/experience-levels"
      );
    return response.data.map(normalizeExperienceLevel);
  };

/* =========================================
   ROADMAP — BASIC INFO
========================================= */

export const createRoadmapBasicInfo =
  async (
    payload: CreateRoadmapBasicInfoRequest
  ): Promise<number> => {
    const response =
      await apiClient.post<ApiResponse<number>>(
        "/Roadmap/Create-basic-info",
        payload
      );
    return unwrapRoadmapEnvelope(response.data);
  };

/* =========================================
   ROADMAP — GET FULL DETAILS (for EDIT mode)
========================================= */

export const getRoadmapDetails =
  async (roadmapId: number): Promise<RoadmapDetailsDto> => {
    const response =
      await apiClient.get<ApiResponse<RoadmapDetailsDto>>(
        `/Roadmap/${roadmapId}`
      );
    return unwrapRoadmapEnvelope(response.data);
  };

/* =========================================
   ROADMAP — SAVE DRAFT  (PUT)
   Maps to: PUT /api/Roadmap/{roadmapId}
   UpdateRoadmapDto on backend:
     Title, Description, Duration,
     TargetLevelFrom, TargetLevelTo,
     TechnologyIds,
     Phases: UpdatePhaseDto[]
       PhaseId?, Title, Summary, Order,
       Topics: TopicDto[]
         Id?, Title, Summary, Order,
         Materials: MaterialDto[],
         TopicTask: TaskDto?
========================================= */

export interface UpdateRoadmapPayload {
  title: string;
  description: string;
  duration: number;
  targetLevelFrom?: number | null;
  targetLevelTo?: number | null;
  technologyIds: number[];
  phases: UpdatePhasePayload[];
}

export interface UpdatePhasePayload {
  phaseId?: number;
  title: string;
  summary: string;
  order: number;
  topics: UpdateTopicPayload[];
}

export interface UpdateTopicPayload {
  id?: number;
  title: string;
  summary: string;
  order: number;
  materials: UpdateMaterialPayload[];
  tasks: UpdateTaskPayload[];
}

export interface UpdateMaterialPayload {
  id?: number;
  title: string;
  url: string;
  /** Backend enum integer: Article=1, Video=2, Pdf=3 */
  materialType: number;
}

export interface UpdateTaskPayload {
  id?: number;
  title: string;
  description: string;
  deadLine?: string;
  attachmentUrl?: string;
}

export const updateRoadmap =
  async (
    roadmapId: number,
    payload: UpdateRoadmapPayload
  ): Promise<void> => {
   const response =
  await apiClient.put<ApiResponse<boolean>>(
    `/Roadmap/${roadmapId}`,
    payload
  );

unwrapRoadmapEnvelope(response.data);
  };

/* =========================================
   ROADMAP — PUBLISH  (PATCH)
   Maps to: PATCH /api/Roadmap/{roadmapId}/publish
   No request body — backend flips status to Published.
========================================= */

export const publishRoadmap =
  async (roadmapId: number): Promise<void> => {
    await apiClient.patch(
      `/Roadmap/${roadmapId}/publish`
    );
  };

/* =========================================
   PHASES
========================================= */

export const createPhase =
  async (
    roadmapId: number,
    payload: CreatePhaseRequest
  ): Promise<number> => {
    const response =
      await apiClient.post<ApiResponse<number>>(
        `/Roadmap/${roadmapId}/phases`,
        payload
      );
    return unwrapRoadmapEnvelope(response.data);
  };

export const updatePhase =
  async (
    phaseId: number,
    payload: UpdatePhaseRequest
  ): Promise<void> => {
    await apiClient.put(
      `/Roadmap/phases/${phaseId}`,
      payload
    );
  };

export const deletePhase =
  async (phaseId: number): Promise<void> => {
    await apiClient.delete(
      `/Roadmap/phases/${phaseId}`
    );
  };

/* =========================================
   TOPICS
========================================= */

export const createTopic =
  async (
    phaseId: number,
    payload: CreateTopicRequest
  ): Promise<number> => {
    const response =
      await apiClient.post<ApiResponse<number>>(
        `/Roadmap/phases/${phaseId}/topics`,
        payload
      );
    return unwrapRoadmapEnvelope(response.data);
  };

export const updateTopic =
  async (
    topicId: number,
    payload: UpdateTopicRequest
  ): Promise<void> => {
    await apiClient.put(
      `/Roadmap/topics/${topicId}`,
      payload
    );
  };

export const deleteTopic =
  async (topicId: number): Promise<void> => {
    await apiClient.delete(
      `/Roadmap/topics/${topicId}`
    );
  };

/* =========================================
   MATERIALS  (batch create)
========================================= */

export const createMaterials =
  async (
    topicId: number,
    materials: MaterialPayload[]
  ): Promise<number[]> => {
    const response =
      await apiClient.post<ApiResponse<number[]>>(
        `/Roadmap/topics/${topicId}/materials`,
        { topicId, materials }
      );
    return unwrapRoadmapEnvelope(response.data);
  };

export const updateMaterial =
  async (
    materialId: number,
    payload: { title: string; url: string; materialType: number }
  ): Promise<void> => {
    await apiClient.put(
      `/Roadmap/materials/${materialId}`,
      payload
    );
  };

export const deleteMaterial =
  async (materialId: number): Promise<void> => {
    await apiClient.delete(
      `/Roadmap/materials/${materialId}`
    );
  };

/* =========================================
   TASKS
========================================= */

export const createTask =
  async (
    topicId: number,
    payload: CreateTaskRequest
  ): Promise<number> => {
    const response =
      await apiClient.post<ApiResponse<number>>(
        `/Roadmap/topics/${topicId}/tasks`,
        {
          ...payload,
          id: topicId,
          attachmentUrl: payload.attachmentUrl?.trim() ?? "",
        }
      );
    return unwrapRoadmapEnvelope(response.data);
  };

export const updateTask =
  async (
    taskId: number,
    payload: UpdateTaskRequest
  ): Promise<void> => {
    await apiClient.put(
      `/Roadmap/tasks/${taskId}`,
      {
        ...payload,
        attachmentUrl: payload.attachmentUrl?.trim() ?? "",
      }
    );
  };

export const deleteTask =
  async (taskId: number): Promise<void> => {
    await apiClient.delete(
      `/Roadmap/tasks/${taskId}`
    );
  };

export const deleteRoadmap =
  async (roadmapId: number): Promise<void> => {
    await apiClient.delete(
      `/Roadmap/${roadmapId}`
    );
  };

/* =========================================
   TASK ATTACHMENT (mentor file → stored URL)
   POST /api/File/upload-task-attachment
========================================= */

export const uploadTaskAttachment =
  async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response =
      await apiClient.post<ApiResponse<FileUploadResponse>>(
        "/File/upload-task-attachment",
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );
    const data = unwrapRoadmapEnvelope(response.data);
    return data.fileUrl;
  };

  export const getRoadmapView =
  async (roadmapId: number) => {

    const response =
      await apiClient.get(
        `/roadmap/view/${roadmapId}`
      );

    return response.data.data;
};

export const getPublishedRoadmapsByMentorProfile = async (
  mentorProfileId: string
): Promise<RoadmapDetailsDto[]> => {
  const response = await apiClient.get(
    `/Roadmap/${mentorProfileId}/published`
  );

  try {
    return unwrapRoadmapEnvelope(
      response.data as ApiResponse<RoadmapDetailsDto[]>
    );
  } catch {
    const body = response.data as ApiResponse<RoadmapDetailsDto[]> | RoadmapDetailsDto[];
    if (Array.isArray(body)) {
      return body;
    }
    if (Array.isArray(body?.data)) {
      return body.data;
    }
    throw new Error('Failed to load published roadmaps');
  }
};

/** Mentor dashboard — own published roadmaps (`View-my-published-Roadmaps`). */
export const getMyPublishedRoadmaps = async (): Promise<RoadmapDetailsDto[]> => {
  const response = await apiClient.get(
    '/Roadmap/View-my-published-Roadmaps'
  );

  try {
    return unwrapRoadmapEnvelope(
      response.data as ApiResponse<RoadmapDetailsDto[]>
    );
  } catch {
    const body = response.data as ApiResponse<RoadmapDetailsDto[]> | RoadmapDetailsDto[];
    if (Array.isArray(body)) {
      return body;
    }
    if (Array.isArray(body?.data)) {
      return body.data;
    }
    return [];
  }
};