import { create } from "zustand";

import {
  createRoadmapBasicInfo,
  getExperienceLevels,
  getRoadmapDetails,
  getSubDomains,
  getDomains,
  publishRoadmap as publishRoadmapRequest,
  updateRoadmap,
  extractErrorMessage,
} from "../services/roadmapService";

import type {
  CreateRoadmapBasicInfoRequest,
  LocalMaterial,
  LocalPhase,
  LocalTask,
  LocalTopic,
  LookupItem,
  MaterialType,
  RoadmapDetailsDto,
} from "../types/roadmap";
import { MATERIAL_TYPE_MAP } from "../types/roadmap";

type Mode = "create" | "edit" | "view";

interface BasicInfoState {
  title: string;
  description: string;
  duration?: number;
  skillDomainId?: number;
  skillDomainName: string;
  subDomainId?: number;
  subDomainName: string;
  targetLevelFrom?: number | null;
  targetLevelTo?: number | null;
  status: string;
}

type BasicInfoErrorKey =
  | "title"
  | "description"
  | "duration"
  | "skillDomainId"
  | "subDomainId"
  | "targetLevelFrom"
  | "targetLevelTo";

type BasicInfoErrors = Partial<Record<BasicInfoErrorKey, string>>;

interface RoadmapBuilderState {
  mode: Mode;
  roadmapId?: number;
  currentStep: number;
  basicInfo: BasicInfoState;
  basicInfoErrors: BasicInfoErrors;
  domains: LookupItem[];
  subDomains: LookupItem[];
  experienceLevels: LookupItem[];
  phases: LocalPhase[];
  error: string | null;
  isSaving: boolean;
  isPublishing: boolean;
  isLoadingDomains: boolean;
  isLoadingSubDomains: boolean;
  isLoadingExperienceLevels: boolean;
  collapsedPhaseIds: string[];
  collapsedTopicIds: string[];
  startCreateSession: () => void;
  loadForEdit: (roadmapId: number) => Promise<void>;
  loadForView: (roadmapId: number) => Promise<void>;
  loadDomains: () => Promise<void>;
  loadSubDomains: (domainId?: number) => Promise<void>;
  loadExperienceLevels: () => Promise<void>;
  setBasicInfo: (patch: Partial<BasicInfoState>) => void;
  clearBasicInfoError: (key: BasicInfoErrorKey) => void;
  dismissError: () => void;
  resetStore: () => void;
  setCurrentStep: (step: number) => void;
  previousStep: () => void;
  saveBasicInfo: () => Promise<boolean>;
  saveDraft: () => Promise<boolean>;
  publishRoadmap: () => Promise<boolean>;
  addPhase: (payload: { title: string; summary: string; order: number; topics: LocalTopic[] }) => Promise<void>;
  updatePhase: (phaseLocalId: string, payload: { title: string; summary: string }) => Promise<void>;
  deletePhase: (phaseLocalId: string) => Promise<void>;
  addTopic: (
    phaseLocalId: string,
    payload: { title: string; summary: string; order: number; materials: LocalMaterial[]; tasks?: LocalTask[] }
  ) => Promise<void>;
  updateTopic: (phaseLocalId: string, topicLocalId: string, payload: { title: string; summary: string }) => Promise<void>;
  deleteTopic: (phaseLocalId: string, topicLocalId: string) => Promise<void>;
  addMaterials: (
    phaseLocalId: string,
    topicLocalId: string,
    materials: Array<{ title: string; url: string; materialType: MaterialType }>
  ) => Promise<void>;
  updateMaterial: (
    phaseLocalId: string,
    topicLocalId: string,
    materialLocalId: string,
    payload: { title: string; url: string; materialType: MaterialType }
  ) => Promise<void>;
  deleteMaterial: (phaseLocalId: string, topicLocalId: string, materialLocalId: string) => Promise<void>;
  addTask: (
    phaseLocalId: string,
    topicLocalId: string,
    payload: { title: string; description: string; deadline?: string; attachmentUrl?: string }
  ) => Promise<void>;
  updateTask: (
    phaseLocalId: string,
    topicLocalId: string,
    taskLocalId: string,
    payload: { title: string; description: string; deadLine?: string | null; attachmentUrl?: string }
  ) => Promise<void>;
  deleteTask: (phaseLocalId: string, topicLocalId: string, taskLocalId: string) => Promise<void>;
  collapseAll: () => void;
  expandAll: () => void;
  togglePhaseCollapsed: (phaseLocalId: string) => void;
  toggleTopicCollapsed: (topicLocalId: string) => void;
  isPhaseCollapsed: (phaseLocalId: string) => boolean;
  isTopicCollapsed: (topicLocalId: string) => boolean;
}

const createLocalId = () => crypto.randomUUID();

const defaultBasicInfo = (): BasicInfoState => ({
  title: "",
  description: "",
  duration: undefined,
  skillDomainId: undefined,
  skillDomainName: "",
  subDomainId: undefined,
  subDomainName: "",
  targetLevelFrom: null,
  targetLevelTo: null,
  status: "Draft",
});

const defaultState = {
  mode: "create" as Mode,
  roadmapId: undefined as number | undefined,
  currentStep: 1,
  basicInfo: defaultBasicInfo(),
  basicInfoErrors: {} as BasicInfoErrors,
  domains: [] as LookupItem[],
  subDomains: [] as LookupItem[],
  experienceLevels: [] as LookupItem[],
  phases: [] as LocalPhase[],
  error: null as string | null,
  isSaving: false,
  isPublishing: false,
  isLoadingDomains: false,
  isLoadingSubDomains: false,
  isLoadingExperienceLevels: false,
  collapsedPhaseIds: [] as string[],
  collapsedTopicIds: [] as string[],
};

function mapMaterialType(value: unknown): MaterialType {
  if (value === "video" || value === "pdf") return value;
  return "article";
}

function fromDetails(details: RoadmapDetailsDto): Pick<RoadmapBuilderState, "roadmapId" | "basicInfo" | "phases" | "mode" | "currentStep"> {
  return {
    roadmapId: details.roadmapId,
    mode: "edit",
    currentStep: 1,
    basicInfo: {
      title: details.title ?? "",
      description: details.description ?? "",
      duration: details.duration,
      skillDomainId: details.skillDomainId,
      skillDomainName: "",
      subDomainId: details.subDomainId,
      subDomainName: "",
      targetLevelFrom: details.targetLevelFrom ?? null,
      targetLevelTo: details.targetLevelTo ?? null,
      status: details.status ?? "Draft",
    },
    phases: (details.phases ?? []).map((phase, phaseIndex) => ({
      _localId: `phase-${phase.phaseId ?? phase.id ?? phaseIndex}`,
      phaseId: phase.phaseId ?? phase.id,
      title: phase.title ?? "",
      summary: phase.summary ?? "",
      order: phase.order ?? phaseIndex + 1,
      topics: (phase.topics ?? []).map((topic, topicIndex) => ({
        _localId: `topic-${topic.topicId ?? topic.id ?? phaseIndex}-${topicIndex}`,
        topicId: topic.topicId ?? topic.id,
        title: topic.title ?? "",
        summary: topic.summary ?? "",
        order: topic.order ?? topicIndex + 1,
        materials: (topic.materials ?? []).map((material, materialIndex) => ({
          _localId: `material-${material.materialId ?? material.id ?? topicIndex}-${materialIndex}`,
          materialId: material.materialId ?? material.id,
          title: material.title ?? "",
          url: material.url ?? "",
          materialType: mapMaterialType(material.materialType),
        })),
        tasks: (topic.tasks ?? topic.topicTask ? [topic.topicTask ?? topic.tasks?.[0]].filter(Boolean) : []).map((task, taskIndex) => ({
          _localId: `task-${task?.taskId ?? task?.id ?? topicIndex}-${taskIndex}`,
          taskId: task?.taskId ?? task?.id,
          title: task?.title ?? "",
          description: task?.description ?? "",
          deadline: task?.deadline ?? task?.deadLine ?? undefined,
          attachmentUrl: task?.attachmentUrl ?? undefined,
        })),
      })),
    })),
  };
}

function toSavePayload(state: RoadmapBuilderState) {
  return {
  title: state.basicInfo.title,
  description: state.basicInfo.description,
  duration: state.basicInfo.duration ?? 0,
  // Backend validation may require numeric enum values (not null).
  // Send 0 as a safe default when levels are not selected.
  targetLevelFrom: state.basicInfo.targetLevelFrom ?? 0,
  targetLevelTo: state.basicInfo.targetLevelTo ?? 0,
    technologyIds: [],
    phases: state.phases.map((phase) => ({
      phaseId: phase.phaseId,
      title: phase.title,
      summary: phase.summary,
      order: phase.order,
      topics: phase.topics.map((topic) => ({
        id: topic.topicId,
        title: topic.title,
        summary: topic.summary,
        order: topic.order,
        materials: topic.materials.map((material) => ({
          id: material.materialId,
          title: material.title,
          url: material.url,
          // convert frontend material type to backend enum integer
          materialType: MATERIAL_TYPE_MAP[material.materialType],
        })),
        topicTask: topic.tasks[0]
          ? {
              id: topic.tasks[0].taskId,
              title: topic.tasks[0].title,
              description: topic.tasks[0].description,
              deadLine: topic.tasks[0].deadline ?? null,
              attachmentUrl: topic.tasks[0].attachmentUrl ?? null,
            }
          : null,
      })),
    })),
  };
}

export const useRoadmapBuilderStore = create<RoadmapBuilderState>((set, get) => ({
  ...defaultState,

  startCreateSession: () => {
    set({
      ...defaultState,
      mode: "create",
    });
  },

  loadDomains: async () => {
    if (get().isLoadingDomains) return;
    set({ isLoadingDomains: true, error: null });
    try {
      const domains = await getDomains();
      set({ domains });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load domains" });
    } finally {
      set({ isLoadingDomains: false });
    }
  },

  loadSubDomains: async (domainId?: number) => {
    if (!domainId) {
      set({ subDomains: [] });
      return;
    }

    set({ isLoadingSubDomains: true, error: null });
    try {
      const subDomains = await getSubDomains(domainId);
      set({ subDomains });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load sub-domains" });
    } finally {
      set({ isLoadingSubDomains: false });
    }
  },

  loadExperienceLevels: async () => {
    if (get().isLoadingExperienceLevels) return;
    set({ isLoadingExperienceLevels: true, error: null });
    try {
      const experienceLevels = await getExperienceLevels();
      set({ experienceLevels });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load experience levels" });
    } finally {
      set({ isLoadingExperienceLevels: false });
    }
  },

  loadForEdit: async (roadmapId: number) => {
    set({ isSaving: true, error: null });
    try {
      const details = await getRoadmapDetails(roadmapId);
      set({ ...fromDetails(details), isSaving: false, collapsedPhaseIds: [], collapsedTopicIds: [] });
    } catch (error) {
      set({ isSaving: false, error: error instanceof Error ? error.message : "Failed to load roadmap" });
    }
  },

  loadForView: async (roadmapId: number) => {
    set({ isSaving: true, error: null });
    try {
      const details = await getRoadmapDetails(roadmapId);
      set({ ...fromDetails(details), mode: "view", currentStep: 2, isSaving: false, collapsedPhaseIds: [], collapsedTopicIds: [] });
    } catch (error) {
      set({ isSaving: false, error: error instanceof Error ? error.message : "Failed to load roadmap" });
    }
  },

  setBasicInfo: (patch) => {
    set((state) => ({ basicInfo: { ...state.basicInfo, ...patch } }));
  },

  clearBasicInfoError: (key) => {
    set((state) => {
      const nextErrors = { ...state.basicInfoErrors };
      delete nextErrors[key];
      return { basicInfoErrors: nextErrors };
    });
  },

  dismissError: () => set({ error: null }),

  resetStore: () => set({ ...defaultState }),

  setCurrentStep: (step) => set({ currentStep: step }),

  previousStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  saveBasicInfo: async () => {
    const state = get();

    const errors: BasicInfoErrors = {};

    if (!state.basicInfo.title.trim()) errors.title = "Title is required";
    if (!state.basicInfo.skillDomainId) errors.skillDomainId = "Domain is required";
    if (!state.basicInfo.subDomainId) errors.subDomainId = "Sub-domain is required";
    if (!state.basicInfo.duration || state.basicInfo.duration <= 0) errors.duration = "Duration must be greater than 0";

    if (Object.keys(errors).length > 0) {
      set({ basicInfoErrors: errors, error: "Please complete the required roadmap information." });
      return false;
    }

    set({ isSaving: true, error: null });
    try {
      if (state.mode === "create" && !state.roadmapId) {
        const payload: CreateRoadmapBasicInfoRequest = {
          title: state.basicInfo.title,
          description: state.basicInfo.description,
          duration: state.basicInfo.duration ?? 0,
          skillDomainId: state.basicInfo.skillDomainId ?? 0,
          subDomainId: state.basicInfo.subDomainId ?? 0,
          targetLevelFrom: state.basicInfo.targetLevelFrom ?? null,
          targetLevelTo: state.basicInfo.targetLevelTo ?? null,
        };

        const roadmapId = await createRoadmapBasicInfo(payload);
        set({ roadmapId, currentStep: 2 });
      } else {
        set({ currentStep: 2 });
      }
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  saveDraft: async () => {
    const state = get();

    if (!state.roadmapId) {
      const ok = await get().saveBasicInfo();
      if (!ok) return false;
    }

    const latest = get();

    if (!latest.roadmapId) {
      set({ error: "Roadmap id is missing" });
      return false;
    }

    set({ isSaving: true, error: null });
    try {
      await updateRoadmap(latest.roadmapId, toSavePayload(latest) as any);
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  publishRoadmap: async () => {
    const draftSaved = await get().saveDraft();
    if (!draftSaved) return false;

    const roadmapId = get().roadmapId;
    if (!roadmapId) return false;

    set({ isPublishing: true, error: null });
    try {
      await publishRoadmapRequest(roadmapId);
      set((state) => ({ basicInfo: { ...state.basicInfo, status: "Published" } }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    } finally {
      set({ isPublishing: false });
    }
  },

  addPhase: async ({ title, summary, order, topics }) => {
    set((state) => ({
      phases: [
        ...state.phases,
        {
          _localId: createLocalId(),
          title,
          summary,
          order,
          topics,
        },
      ],
    }));
  },

  updatePhase: async (phaseLocalId, payload) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId ? { ...phase, ...payload } : phase
      ),
    }));
  },

  deletePhase: async (phaseLocalId) => {
    set((state) => ({
      phases: state.phases.filter((phase) => phase._localId !== phaseLocalId),
      collapsedPhaseIds: state.collapsedPhaseIds.filter((id) => id !== phaseLocalId),
      collapsedTopicIds: state.collapsedTopicIds.filter((id) => !state.phases.find((phase) => phase._localId === phaseLocalId)?.topics.some((topic) => topic._localId === id)),
    }));
  },

  addTopic: async (phaseLocalId, payload) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: [
                ...phase.topics,
                {
                  _localId: createLocalId(),
                  title: payload.title,
                  summary: payload.summary,
                  order: payload.order,
                  materials: payload.materials,
                  tasks: payload.tasks ?? [],
                },
              ],
            }
          : phase
      ),
    }));
  },

  updateTopic: async (phaseLocalId, topicLocalId, payload) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: phase.topics.map((topic) =>
                topic._localId === topicLocalId ? { ...topic, ...payload } : topic
              ),
            }
          : phase
      ),
    }));
  },

  deleteTopic: async (phaseLocalId, topicLocalId) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? { ...phase, topics: phase.topics.filter((topic) => topic._localId !== topicLocalId) }
          : phase
      ),
      collapsedTopicIds: state.collapsedTopicIds.filter((id) => id !== topicLocalId),
    }));
  },

  addMaterials: async (phaseLocalId, topicLocalId, materials) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: phase.topics.map((topic) =>
                topic._localId === topicLocalId
                  ? {
                      ...topic,
                      materials: [
                        ...topic.materials,
                        ...materials.map((material) => ({
                          _localId: createLocalId(),
                          title: material.title,
                          url: material.url,
                          materialType: material.materialType,
                        })),
                      ],
                    }
                  : topic
              ),
            }
          : phase
      ),
    }));
  },

  updateMaterial: async (phaseLocalId, topicLocalId, materialLocalId, payload) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: phase.topics.map((topic) =>
                topic._localId === topicLocalId
                  ? {
                      ...topic,
                      materials: topic.materials.map((material) =>
                        material._localId === materialLocalId ? { ...material, ...payload } : material
                      ),
                    }
                  : topic
              ),
            }
          : phase
      ),
    }));
  },

  deleteMaterial: async (phaseLocalId, topicLocalId, materialLocalId) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: phase.topics.map((topic) =>
                topic._localId === topicLocalId
                  ? { ...topic, materials: topic.materials.filter((material) => material._localId !== materialLocalId) }
                  : topic
              ),
            }
          : phase
      ),
    }));
  },

  addTask: async (phaseLocalId, topicLocalId, payload) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: phase.topics.map((topic) =>
                topic._localId === topicLocalId
                  ? {
                      ...topic,
                      tasks: [
                        ...topic.tasks,
                        {
                          _localId: createLocalId(),
                          title: payload.title,
                          description: payload.description,
                          deadline: payload.deadline,
                          attachmentUrl: payload.attachmentUrl,
                        },
                      ],
                    }
                  : topic
              ),
            }
          : phase
      ),
    }));
  },

  updateTask: async (phaseLocalId, topicLocalId, taskLocalId, payload) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: phase.topics.map((topic) =>
                topic._localId === topicLocalId
                  ? {
                      ...topic,
                      tasks: topic.tasks.map((task) =>
                        task._localId === taskLocalId
                          ? {
                              ...task,
                              title: payload.title,
                              description: payload.description,
                              deadline: payload.deadLine ?? undefined,
                              attachmentUrl: payload.attachmentUrl,
                            }
                          : task
                      ),
                    }
                  : topic
              ),
            }
          : phase
      ),
    }));
  },

  deleteTask: async (phaseLocalId, topicLocalId, taskLocalId) => {
    set((state) => ({
      phases: state.phases.map((phase) =>
        phase._localId === phaseLocalId
          ? {
              ...phase,
              topics: phase.topics.map((topic) =>
                topic._localId === topicLocalId
                  ? { ...topic, tasks: topic.tasks.filter((task) => task._localId !== taskLocalId) }
                  : topic
              ),
            }
          : phase
      ),
    }));
  },

  collapseAll: () => {
    const state = get();
    set({
      collapsedPhaseIds: state.phases.map((phase) => phase._localId),
      collapsedTopicIds: state.phases.flatMap((phase) => phase.topics.map((topic) => topic._localId)),
    });
  },

  expandAll: () => set({ collapsedPhaseIds: [], collapsedTopicIds: [] }),

  togglePhaseCollapsed: (phaseLocalId) => {
    set((state) => ({
      collapsedPhaseIds: state.collapsedPhaseIds.includes(phaseLocalId)
        ? state.collapsedPhaseIds.filter((id) => id !== phaseLocalId)
        : [...state.collapsedPhaseIds, phaseLocalId],
    }));
  },

  toggleTopicCollapsed: (topicLocalId) => {
    set((state) => ({
      collapsedTopicIds: state.collapsedTopicIds.includes(topicLocalId)
        ? state.collapsedTopicIds.filter((id) => id !== topicLocalId)
        : [...state.collapsedTopicIds, topicLocalId],
    }));
  },

  isPhaseCollapsed: (phaseLocalId) => get().collapsedPhaseIds.includes(phaseLocalId),

  isTopicCollapsed: (topicLocalId) => get().collapsedTopicIds.includes(topicLocalId),
}));
