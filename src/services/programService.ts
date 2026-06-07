import api from "../config/api";
import lookupAPI from "./lookupService";
import type { CreateProgramFormData } from "../components/create-program/types";

/** Backend `ProgramPostStatus`: Draft = 1, Published = 2 */
export const PROGRAM_POST_STATUS = {
  DRAFT: 1,
  PUBLISHED: 2,
} as const;

const ANSWER_TYPES = new Set([
  "Paragraph",
  "MultipleChoice",
  "TrueFalse",
]);

export interface ProgramTechnologyRequirement {
  technologyId: number;
  requiredExperienceLevel: number;
  technologyName?: string;
}

export interface ProgramQuestionPayload {
  questionText: string;
  answerType: string;
  maxSelections?: number | null;
  options?: string[];
}

export interface CreateProgramApiInput {
  title: string;
  description: string;

  domainId: number;
  subDomainId: number;

  targetLevel: number;
  educationLevel: number;

  capacity: number;
duration: string | number;
  availability: string;

  technologies: ProgramTechnologyRequirement[];

  status: number;

  roadmapId?: number | null;

  questions: ProgramQuestionPayload[];

  programImageUrl?: string;
deadline?: string | null;
}

export interface CreateProgramApiResponse {
  success: boolean;
  message: string;
  data?: { programId?: number };
  errors?: string[];
}

/** Mentor's published roadmaps from `GET /Roadmap/View-my-published-Roadmaps`. */
export interface RoadmapBasicOption {
  roadmapId: number;
  title: string;
  subDomainId: number;
}

export async function fetchRoadmapBasicOptions(): Promise<
  RoadmapBasicOption[]
> {
  const response = await api.get<{
    success?: boolean;
    data?: unknown;
  }>("/Roadmap/View-my-published-Roadmaps");

  const envelope = response.data as {
    success?: boolean;
    data?: unknown;
  };
  const raw =
    envelope?.success === true && Array.isArray(envelope.data)
      ? envelope.data
      : [];

  return raw
    .map((r: Record<string, unknown>) => ({
      roadmapId: Number(
        r.roadmapId ?? r.RoadmapId ?? 0
      ),
      title: String(
        r.title ?? "Roadmap"
      ),
      subDomainId: Number(
        r.subDomainId ?? r.SubDomainId ?? 0
      ),
    }))
    .filter(
      (r) =>
        Number.isInteger(
          r.roadmapId
        ) &&
        r.roadmapId > 0 &&
        Number.isInteger(
          r.subDomainId
        ) &&
        r.subDomainId > 0
    );
}

export async function getAllowedTechnologyIdsForSubdomain(
  subDomainId: number
): Promise<Set<number>> {
  if (
    !Number.isFinite(
      subDomainId
    ) ||
    subDomainId < 1
  ) {
    return new Set();
  }

  const res =
    await lookupAPI.getTechnologies(
      String(
        subDomainId
      )
    );

  if (
    !res.success ||
    !res.data
  ) {
    return new Set();
  }

  return new Set(
    res.data.map(
      (
        t
      ) =>
        Number(
          t.id
        )
    )
  );
}

export function sanitizeTechnologiesForSubdomain(
  technologies: ProgramTechnologyRequirement[],
  allowedIds: Set<number>
): ProgramTechnologyRequirement[] {
  return technologies.filter(
    (
      t
    ) =>
      Number.isInteger(
        t.technologyId
      ) &&
      t.technologyId > 0 &&
      allowedIds.has(
        t.technologyId
      ) &&
      typeof t.requiredExperienceLevel ===
        "number" &&
      Number.isInteger(
        t.requiredExperienceLevel
      ) &&
      t.requiredExperienceLevel >=
        1 &&
      t.requiredExperienceLevel <= 4
  );
}

export function resolveRoadmapIdForSubmit(
  roadmapId: number | null | undefined,
  subDomainId: number,
  allowedRoadmaps: RoadmapBasicOption[]
): number | null {
  if (
    roadmapId == null ||
    !Number.isInteger(
      roadmapId
    ) ||
    roadmapId < 1 ||
    !Number.isInteger(
      subDomainId
    ) ||
    subDomainId < 1
  ) {
    return null;
  }

  const ok =
    allowedRoadmaps.some(
      (
        r
      ) =>
        r.roadmapId ===
          roadmapId &&
        r.subDomainId ===
          subDomainId
    );

  return ok
    ? roadmapId
    : null;
}

export function buildQuestionsPayload(
  questions: Array<{
    questionText: string;
    answerType: string;
    maxSelections?: number | null;
    options?: string[];
  }>
): ProgramQuestionPayload[] {
  return questions
    .filter(
      (
        q
      ) =>
        q.questionText.trim()
          .length >= 3
    )
    .filter(
      (
        q
      ) =>
        ANSWER_TYPES.has(
          q.answerType
        )
    )
    .map(
      (
        q
      ) => {
        const options = (
          q.options ?? []
        )
          .map(
            (
              o
            ) =>
              String(
                o
              ).trim()
          )
          .filter(
            Boolean
          );

        return {
          questionText:
            q.questionText.trim(),
          answerType:
            q.answerType as "" | "Paragraph" | "MultipleChoice" | "TrueFalse",
          maxSelections:
            q.maxSelections ??
            null,
          options:
            q.answerType ===
            "MultipleChoice"
              ? options
              : [],
        };
      }
    );
}

export function formatCreateProgramFailureMessage(
  body:
    | Partial<CreateProgramApiResponse>
    | undefined,
  fallback: string
): string {
  const parts: string[] =
    [];

  if (
    body?.message &&
    body.message.trim()
  ) {
    parts.push(
      body.message.trim()
    );
  }

  if (
    Array.isArray(
      body?.errors
    )
  ) {
    for (const e of body.errors!) {
      if (
        typeof e ===
          "string" &&
        e.trim()
      ) {
        parts.push(
          e.trim()
        );
      }
    }
  }

  if (
    parts.length
  ) {
    return [
      ...new Set(
        parts
      ),
    ].join(
      " — "
    );
  }

  return fallback;
}

export const createProgram = async (
  data: CreateProgramApiInput
): Promise<CreateProgramApiResponse> => {
  const technologies = data.technologies.map(
    (
      t
    ) => ({
      technologyId: Number(
        t.technologyId
      ),
      requiredExperienceLevel: Number(
        t.requiredExperienceLevel
      ),
    })
  );

  // Filter questions to only include valid ones (non-empty text, valid answer type)
  const validQuestions = data.questions
    .filter(
      (
        q
      ) => {
        const text =
          q.questionText.trim();
        return (
          text.length >= 3 &&
          ANSWER_TYPES.has(
            q.answerType
          )
        );
      }
    )
    .map(
      (
        q
      ) => {
        const options =
          q.answerType ===
          "MultipleChoice"
            ? (
                q.options ?? []
              )
                .map(
                  (
                    o
                  ) =>
                    String(
                      o
                    ).trim()
                )
                .filter(
                  Boolean
                )
            : [];

        return {
          questionText:
            q.questionText.trim(),
          answerType:
            q.answerType,
          maxSelections:
            q.answerType ===
            "MultipleChoice"
              ? q.maxSelections ??
                null
              : null,
          options,
        };
      }
    );

  const payload: Record<
    string,
    unknown
  > = {
    title: data.title.trim(),
    description:
      data.description.trim(),

    domainId: Number(
      data.domainId
    ),
    subDomainId: Number(
      data.subDomainId
    ),

    targetLevel: Number(
      data.targetLevel
    ),
    educationLevel: Number(
      data.educationLevel
    ),

    capacity: Number(
      data.capacity
    ),

    duration:
      data.duration
        ? `${data.duration} ${Number(data.duration) === 1 ? "Month" : "Months"}`
        : "",

    availability:
      data.availability &&
      data.availability.trim()
        ? data.availability.trim()
        : "",

    technologies,

    status: Number(
      data.status
    ),

    // Use filtered valid questions
questions:
  validQuestions,

...(data.programImageUrl && {
  programImageUrl:
    data.programImageUrl,
}),

...(data.deadline && {
  deadline: data.deadline,
}),
  };

  // Only include roadmapId if it's valid
  if (
    data.roadmapId != null &&
    Number.isInteger(
      data.roadmapId
    ) &&
    data.roadmapId > 0
  ) {
    payload.roadmapId =
      data.roadmapId;
  }

 console.log(
  "PAYLOAD SENT TO api:",
  payload
);

const response =
 await api.post(
  "/ProgramMentor/Create_Program",
  payload
);

  return response.data;
};

export const fetchProgramById = async (programId: number) => {
  const resp = await api.get(
  `/ProgramMentor/${programId}/GetById`
);

  return resp.data;
};

export const updateProgram = async (
  programId: number,
  data: CreateProgramApiInput,
  options?: { omitStatus?: boolean }
) => {
  // reuse the same payload shape as createProgram
  const technologies = data.technologies.map((t) => ({
    technologyId: Number(t.technologyId),
    requiredExperienceLevel: Number(t.requiredExperienceLevel),
  }));

  const validQuestions = data.questions
    .filter((q) => q.questionText.trim().length >= 3 && ANSWER_TYPES.has(q.answerType))
    .map((q) => ({
      questionText: q.questionText.trim(),
      answerType: q.answerType,
      maxSelections: q.answerType === "MultipleChoice" ? q.maxSelections ?? null : null,
      options: q.answerType === "MultipleChoice" ? (q.options ?? []).map((o) => String(o).trim()).filter(Boolean) : [],
    }));

  const payload: Record<string, unknown> = {
    title: data.title.trim(),
    description: data.description.trim(),
    domainId: Number(data.domainId),
    subDomainId: Number(data.subDomainId),
    targetLevel: Number(data.targetLevel),
    educationLevel: Number(data.educationLevel),
    capacity: Number(data.capacity),
    duration: data.duration ? `${data.duration} ${Number(data.duration) === 1 ? "Month" : "Months"}` : "",
    availability: data.availability && String(data.availability).trim() ? String(data.availability).trim() : "",
    technologies,
    questions: validQuestions,
  };

  if (!options?.omitStatus && data.status) {
    payload.status = Number(data.status);
  }

  if (data.roadmapId != null && Number.isInteger(data.roadmapId) && data.roadmapId > 0) {
    payload.roadmapId = data.roadmapId;
  }

  if (data.deadline) {
    payload.deadline = new Date(data.deadline).toISOString();
  }

  if (data.programImageUrl) {
    payload.programImageUrl = data.programImageUrl;
  }

  const response = await api.patch(
    `/ProgramMentor/${programId}/update`,
    payload
  );

  return response.data as CreateProgramApiResponse;
};

export const deleteProgram = async (programId: number) => {
  const response = await api.delete(`/ProgramMentor/${programId}`);
  return response.data as CreateProgramApiResponse;
};

export const unpublishProgram = async (programId: number) => {
  const response = await api.patch(`/ProgramMentor/${programId}/update`, {
    status: PROGRAM_POST_STATUS.DRAFT,
  });
  return response.data as CreateProgramApiResponse;
};

const EDUCATION_LEVEL_MAP: Record<string, number> = {
  Freshman: 1,
  Sophomore: 2,
  Junior: 3,
  Senior: 4,
  Graduate: 5,
};

const TARGET_LEVEL_MAP: Record<string, number> = {
  Beginner: 1,
  Junior: 2,
  Mid: 3,
  Senior: 4,
};

export function resolveProgramImageUrl(
  programImageUrl?: string | null
): string | undefined {
  if (!programImageUrl) return undefined;

  if (programImageUrl.startsWith("http")) {
    return programImageUrl;
  }

  const apiRoot = (import.meta.env.VITE_API_URL ?? "http://localhost:5069/api").replace(
    /\/api\/?$/,
    ""
  );
  const path = programImageUrl.startsWith("/")
    ? programImageUrl
    : `/${programImageUrl}`;

  return `${apiRoot}${path}`;
}

function parseEnumToNumber(
  value: unknown,
  map: Record<string, number>
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (map[trimmed]) return map[trimmed];
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber)) return asNumber;
  }

  return 0;
}

function formatDeadlineForInput(deadline?: string | null): string {
  if (!deadline || deadline.startsWith("0001-01-01")) {
    return "";
  }

  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}


/** Maps mentor `GetById` / published list payload into create-program form values. */
export function mapProgramResponseToFormData(
  raw: Record<string, unknown>
): Partial<CreateProgramFormData> {
  const technologies = Array.isArray(raw.technologies)
    ? raw.technologies.map((t: Record<string, unknown>) => ({
        technologyId: Number(t.technologyId ?? t.TechnologyId ?? 0),
        requiredExperienceLevel: Number(
          t.requiredExperienceLevel ?? t.RequiredExperienceLevel ?? 0
        ),
      }))
    : [];

  const questions = Array.isArray(raw.questions)
    ? raw.questions.map((q: Record<string, unknown>) => {
        const rawAnswerType = String(q.answerType ?? q.AnswerType ?? "Paragraph");
        const answerType =
          rawAnswerType === "MultipleChoice" ||
          rawAnswerType === "TrueFalse" ||
          rawAnswerType === "Paragraph"
            ? (rawAnswerType as "Paragraph" | "MultipleChoice" | "TrueFalse")
            : "Paragraph";
        const rawOptions = q.options ?? q.Options;

        return {
          questionText: String(q.questionText ?? q.QuestionText ?? ""),
          answerType,
          maxSelections:
            typeof q.maxSelections === "number" || q.maxSelections === null
              ? q.maxSelections
              : typeof q.MaxSelections === "number" || q.MaxSelections === null
                ? q.MaxSelections
                : null,
          options: Array.isArray(rawOptions)
            ? rawOptions.map((o: unknown) => String(o))
            : [],
        };
      })
    : [];

  const programImageUrl = String(
    raw.programImageUrl ?? raw.ProgramImageUrl ?? ""
  );

  return {
    title: String(raw.title ?? raw.Title ?? ""),
    description: String(raw.description ?? raw.Description ?? ""),
    domainId: Number(raw.domainId ?? raw.DomainId ?? 0),
    subDomainId: Number(raw.subDomainId ?? raw.SubDomainId ?? 0),
    targetLevel: parseEnumToNumber(
      raw.targetLevel ?? raw.TargetLevel,
      TARGET_LEVEL_MAP
    ),
    educationLevel: parseEnumToNumber(
      raw.educationLevel ?? raw.EducationLevel,
      EDUCATION_LEVEL_MAP
    ),
    capacity: Number(raw.capacity ?? raw.Capacity ?? 1),
    duration: parseInt(String(raw.duration ?? raw.Duration ?? "").replace(/\D/g, ""), 10) || "",
    availability: String(raw.availability ?? raw.Availability ?? ""),
    technologies,
    roadmapId:
      raw.roadmapId != null || raw.RoadmapId != null
        ? Number(raw.roadmapId ?? raw.RoadmapId)
        : null,
    questions,
    deadline: formatDeadlineForInput(
      String(raw.deadline ?? raw.Deadline ?? "")
    ),
    existingImageUrl: resolveProgramImageUrl(programImageUrl),
    programStatus: Number(
      raw.programPostStatus ?? raw.ProgramPostStatus ?? PROGRAM_POST_STATUS.PUBLISHED
    ),
  };
};

export async function uploadProgramImage(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/File/upload-program-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export const getMyPublishedPrograms = async () => {
  const response = await api.get(
    "/ProgramMentor/AllpublishedPrograms"
  );

  return response.data;
};

export const getPublishedProgramsByMentorProfile = async (
  mentorProfileId: string,
  page = 1,
  pageSize = 50
) => {
  const response = await api.get(
    `/ProgramMentor/${mentorProfileId}/published`,
    { params: { page, pageSize } }
  );

  return response.data;
};

export interface ProgramViewDto {
  programId: number;

  title: string;

  description: string;

  programImageUrl?: string;

  targetLevel: string;

  domainName: string;

  subDomainName: string;

  duration: string;

  educationLevel?: string;

  capacity?: number;

  availability?: string;

  technologies: ProgramTechnologyRequirement[];

  deadline: string;

  menteesCount: number;

  likesCount: number;

  commentsCount: number;

  shareUrl: string;

  mentorProfileId: string;

  mentorName: string;

  profilePictureUrl?: string;

  bio?: string;

  isLiked: boolean;

  isSaved: boolean;

  isApplied: boolean;

  applicationStatus: string;

  roadmap?: {
    roadmapId: number;
    title: string;
    phases?: Array<{
      phaseId: number;
      title: string;
      description?: string;
    }>;
  };
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const getProgramView = async (
  programId: number
): Promise<ProgramViewDto> => {
  const response = await api.get<ApiResponse<ProgramViewDto>>(
    `/ProgramMentee/${programId}/view`
  );

  return response.data.data;
};

export const toggleProgramLike = async (
  programId: number
) => {
  const response = await api.post(
    `/ProgramMentee/${programId}/like`
  );

  return response.data;
};

export const toggleProgramSave = async (
  programId: number
) => {
  const response = await api.post(
    `/ProgramMentee/${programId}/save`
  );

  return response.data;
};


export interface ProgramQuestionDto {
  questionId: number;
  questionText: string;
}

export const getProgramQuestions = async (
  programId: number
): Promise<ProgramQuestionDto[]> => {
  const response = await api.get(
    `/ProgramMentee/${programId}/questions`
  );

  return response.data.data;
};

export const canApply = async (programId: number) => {
  const response = await api.get(`/ProgramMentee/${programId}/can-apply`);
  return response.data as ApiResponse<boolean>;
};

export const applyToProgram = async (
  programId: number,
  payload: {
   answers: {
  questionId: number;
  questionAnswer: string;
}[];
    additionalComment?: string;
  }
) => {
  const response = await api.post(
    `/ProgramMentee/${programId}/apply`,
    payload
  );

  return response.data;
};

export const withdrawApplication =
  async (programId: number) => {

    const response = await api.delete(
      `/ProgramMentee/${programId}/withdraw-application`
    );

    return response.data;
};

export const getApplicantsByProgram =
  async (
    programId: number,
    pageNumber = 1,
    pageSize = 10,
    status?: string,
    search?: string
  ) => {

    const response = await api.get(
      `/Applicants/by-program`,
      {
        params: {
          programId,
          pageNumber,
          pageSize,
          status,
          search,
        },
      }
    );

    return response.data;
};

export const acceptApplicant =
  async (applicationId: number) => {

    const response = await api.patch(
      `/Applicants/${applicationId}/accept`
    );

    return response.data;
};

export const rejectApplicant =
  async (applicationId: number) => {

    const response = await api.patch(
      `/Applicants/${applicationId}/reject`
    );

    return response.data;
};

export const setApplicantPending =
  async (applicationId: number) => {

    const response = await api.patch(
      `/Applicants/${applicationId}/pending`
    );

    return response.data;
};

export const exportApplicants =
  async (programId: number) => {

    const response = await api.get(
      `/Applicants/by-program`,
      {
        params: {
          programId,
          isExport: true,
        },

        responseType: "blob",
      }
    );

    return response.data;
};

export const sendResults =
  async (programId: number) => {

    const response = await api.post(
      `/Applicants/program/${programId}/notify-all`
    );

    return response.data;
};

export const getProgramComments =
  async (programId: number) => {

    const response =
      await api.get(
        `/Comment?programId=${programId}`
      );

    return response.data.data;
};


export const addProgramComment =
  async (
    programId: number,
    commentText: string
  ) => {

    const response =
      await api.post(
        `/Comment?programId=${programId}`,
        commentText,
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data.data;
};

export const getMyApplications = async (
  pageNumber = 1,
  pageSize = 20
) => {
const response = await api.get(
      `/Applicants/my-applications?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

  return response.data;
};