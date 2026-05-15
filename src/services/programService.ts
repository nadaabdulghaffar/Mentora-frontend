import axios from "axios";
import api from "../config/api";
import lookupAPI from "./lookupService";

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
  duration: string;
  availability: string;

  technologies: ProgramTechnologyRequirement[];

  status: number;

  roadmapId?: number | null;

  questions: ProgramQuestionPayload[];
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
            q.answerType,
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

    // Send empty string for empty optional fields (matches backend expectations)
    duration:
      data.duration &&
      data.duration.trim()
        ? data.duration.trim()
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
  "PAYLOAD SENT TO AXIOS:",
  payload
);

const response =
  await axios.post(
    "http://localhost:5069/api/ProgramMentor/Create_Program",
    payload,
    {
      headers: {
        "Content-Type":
          "application/json",

        Authorization: `Bearer ${localStorage.getItem(
          "accessToken"
        )}`,
      },
    }
  );

  return response.data;
};

export const fetchProgramById = async (programId: number) => {
  const resp = await axios.get(`http://localhost:5069/api/ProgramMentor/${programId}/GetById`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  return resp.data;
};

export const updateProgram = async (programId: number, data: CreateProgramApiInput) => {
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

  const payload: any = {
    title: data.title.trim(),
    description: data.description.trim(),
    domainId: Number(data.domainId),
    subDomainId: Number(data.subDomainId),
    targetLevel: Number(data.targetLevel),
    educationLevel: Number(data.educationLevel),
    capacity: Number(data.capacity),
    duration: data.duration && data.duration.trim() ? data.duration.trim() : "",
    availability: data.availability && data.availability.trim() ? data.availability.trim() : "",
    technologies,
    status: Number(data.status),
    questions: validQuestions,
  };

  if (data.roadmapId != null && Number.isInteger(data.roadmapId) && data.roadmapId > 0) {
    payload.roadmapId = data.roadmapId;
  }

  const response = await axios.patch(
    `http://localhost:5069/api/ProgramMentor/${programId}/update`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  return response.data as CreateProgramApiResponse;
};
