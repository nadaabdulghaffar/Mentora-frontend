/* =========================================
FILE: src/components/create-program/CreateProgramModal.tsx
(Added onDiscard reset + step reset)
========================================= */

import axios from "axios";
import { useEffect, useState } from "react";
import { Formik, getIn } from "formik";

import BaseModal from "../modals/BaseModal";

import ProgramBasicsStep from "./ProgramBasicsStep";
import ProgramRequirementsStep from "./ProgramRequirementsStep";
import ProgramQuestionsStep from "./ProgramQuestionsStep";

import { createProgramSchema } from "./schema";
import type { CreateProgramFormData } from "./types";
import {
  buildQuestionsPayload,
  createProgram,
  fetchProgramById,
  fetchRoadmapBasicOptions,
  formatCreateProgramFailureMessage,
  getAllowedTechnologyIdsForSubdomain,
  PROGRAM_POST_STATUS,
  resolveRoadmapIdForSubmit,
  sanitizeTechnologiesForSubdomain,
  type CreateProgramApiInput,
  type CreateProgramApiResponse,
  updateProgram,
} from "../../services/programService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  programId?: number | null;
  initialValues?: Partial<CreateProgramFormData> | null;
};

function goToStepWithErrors(errors: any, setStep: (n: number) => void) {
  if (
    errors.domainId ||
    errors.subDomainId ||
    errors.title ||
    errors.description
  ) {
    setStep(1);
    return;
  }
  if (
    errors.educationLevel ||
    errors.targetLevel ||
    errors.capacity ||
    errors.duration ||
    errors.availability ||
    errors.technologies
  ) {
    setStep(2);
    return;
  }
  if (errors.questions) {
    setStep(3);
  }
}

/** Publish-time check: MCQ rows with text must have options; returns form question index or -1. */
function findFirstMcqMissingOptions(
  questions: CreateProgramFormData["questions"]
): number {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const text = q.questionText.trim();
    if (text.length < 3) continue;
    if (q.answerType !== "MultipleChoice") continue;
    const opts = (q.options ?? [])
      .map((o) => String(o).trim())
      .filter(Boolean);
    if (opts.length === 0) return i;
  }
  return -1;
}

export default function CreateProgramModal({ isOpen, onClose, programId = null, initialValues = null }: Props) {
  useEffect(() => {
    console.log('CreateProgramModal mounted, isOpen=', isOpen);
    return () => console.log('CreateProgramModal unmounted');
  }, []);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<"draft" | "publish" | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
    }
  }, [isOpen]);

  const progress = (step / 3) * 100;

  const nextStep = async (
    validateForm: () => Promise<Record<string, unknown>>,
    values: CreateProgramFormData
  ) => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      onInvalid(errors);
      return;
    }
    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleDiscard = (resetForm: any) => {
    resetForm();
    setStep(1);
    setSubmitError(null);
    onClose();
  };
  const runCreateProgram = async (
    data: CreateProgramFormData,
    kind: "draft" | "publish",
    setFieldError: (field: string, message?: string | undefined) => void,
    resetForm: () => void
  ) => {
    setSubmitError(null);

    let allowedTechIds: Set<number>;
    let roadmapAllowList: Awaited<ReturnType<typeof fetchRoadmapBasicOptions>> = [];

    try {
      allowedTechIds = await getAllowedTechnologyIdsForSubdomain(data.subDomainId);
    } catch {
      setSubmitError(
        "Could not verify technologies for this sub-domain. Check your connection and try again."
      );
      return;
    }

    try {
      roadmapAllowList = await fetchRoadmapBasicOptions();
    } catch {
      roadmapAllowList = [];
    }

    const rawTechnologies = data.technologies ?? [];
    const technologiesSanitized = sanitizeTechnologiesForSubdomain(rawTechnologies, allowedTechIds);

    if (kind === "publish") {
      if (technologiesSanitized.length === 0) {
        if (rawTechnologies.length > 0) {
          setFieldError(
            "technologies",
            "Your technology selections are not valid for this sub-domain. Re-select them in step 2."
          );
        } else {
          setFieldError(
            "technologies",
            "Publishing requires at least one technology from this sub-domain, with an experience level chosen for each."
          );
        }
        setStep(2);
        return;
      }
    }

    const mcqIdx = kind === "publish" ? findFirstMcqMissingOptions(data.questions) : -1;
    if (mcqIdx >= 0) {
      setSubmitError(
        `Question ${mcqIdx + 1}: multiple-choice items need at least one answer option before publishing.`
      );
      setStep(3);
      requestAnimationFrame(() => {
        const el = document.getElementById(`questions.${mcqIdx}.questionText`);
        if (el instanceof HTMLElement) el.focus();
      });
      return;
    }

    const apiQuestions = buildQuestionsPayload(data.questions);

    const safeRoadmapId = resolveRoadmapIdForSubmit(data.roadmapId, data.subDomainId, roadmapAllowList);

    const input: CreateProgramApiInput = {
      title: data.title,
      description: data.description,
      domainId: data.domainId,
      subDomainId: data.subDomainId,
      targetLevel: data.targetLevel,
      educationLevel: data.educationLevel,
      capacity: data.capacity,
      duration: data.duration || "",
      availability: data.availability || "",
      technologies: technologiesSanitized,
      roadmapId: safeRoadmapId,
      questions: apiQuestions,
      status: kind === "publish" ? PROGRAM_POST_STATUS.PUBLISHED : PROGRAM_POST_STATUS.DRAFT,
    };

    setIsSubmitting(true);

    try {
      let res: CreateProgramApiResponse | null = null;

      if (programId && programId > 0) {
        // edit flow
        res = await updateProgram(programId, input);
      } else {
        res = await createProgram(input);
      }

      if (!res || !res.success) {
        setSubmitError(formatCreateProgramFailureMessage(res ?? undefined, "Could not save program"));
        return;
      }
      resetForm();
      setStep(1);
      setSubmitError(null);
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as Partial<CreateProgramApiResponse> | undefined;
        const status = err.response?.status;
        const fallback = status ? `Request failed (${status})` : err.message || "Request failed";
        setSubmitError(formatCreateProgramFailureMessage(body, fallback));
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    goToStepWithErrors(errors, setStep);
    const firstStep =
      errors.domainId || errors.subDomainId || errors.title || errors.description
        ? 1
        : errors.educationLevel ||
          errors.targetLevel ||
          errors.capacity ||
          errors.duration ||
          errors.availability ||
          errors.technologies
        ? 2
        : 3;
    requestAnimationFrame(() => {
      if (firstStep === 1 && (errors.title || errors.description)) {
        const id = errors.title ? "title" : "description";
        const el = document.getElementById(id);
        if (el instanceof HTMLElement) el.focus();
      }
    });
  };

  const startDraft = async (validateForm: any, values: CreateProgramFormData, setFieldError: any, resetForm: any) => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      onInvalid(errors);
      return;
    }
    await runCreateProgram(values, "draft", setFieldError, resetForm);
  };


  const startPublish = async (validateForm: any, values: CreateProgramFormData, setFieldError: any, resetForm: any) => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      onInvalid(errors);
      return;
    }
    await runCreateProgram(values, "publish", setFieldError, resetForm);
  };

  const headerExtra = (
    <div className="mt-6">
      <div className="flex justify-between text-xs sm:text-sm font-semibold text-primary mb-2">
        <span>STEP {step}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );

  const subtitle =
    step === 1
      ? "Create your mentorship program and attract the right mentees."
      : step === 2
        ? "Set requirements and expectations for applicants."
        : "Customize application questions.";

  const width = step === 1 ? "lg:max-w-5xl" : "lg:max-w-3xl";
  const mergedInitialValues: CreateProgramFormData = {
    domainId: 0,
    subDomainId: 0,
    title: "",
    description: "",
    educationLevel: 0,
    targetLevel: 0,
    capacity: 1,
    duration: "",
    availability: "",
    technologies: [],
    roadmapId: null,
    questions: [],
    image: undefined,
    deadline: "",
    ...(initialValues || {}),
  } as CreateProgramFormData;

  return (
    <Formik
      enableReinitialize
      initialValues={mergedInitialValues}
      validate={async (values) => {
        try {
          createProgramSchema.parse(values);
          return {};
        } catch (e: any) {
          const out: any = {};
          if (e?.errors) {
            // zod error
            const z = e;
            const flat = z.flatten ? z.flatten() : null;
            if (flat && flat.fieldErrors) {
              Object.keys(flat.fieldErrors).forEach((k) => {
                const arr = flat.fieldErrors[k];
                if (arr && arr.length > 0) out[k] = arr.join(", ");
              });
            }
          }
          return out;
        }
      }}
      onSubmit={() => {}}
    >
      {(formik) => {
        const values = formik.values as CreateProgramFormData;

        const hasChanges =
          values.title?.trim().length > 0 ||
          values.description?.trim().length > 0 ||
          values.domainId > 0 ||
          values.subDomainId > 0 ||
          values.educationLevel > 0 ||
          values.targetLevel > 0 ||
          values.capacity > 1 ||
          values.duration?.trim().length > 0 ||
          values.availability?.trim().length > 0 ||
          (values.technologies && values.technologies.length > 0) ||
          values.questions?.length > 0 ||
          !!values.image ||
          (values.deadline && values.deadline.length > 0) ||
          (values.roadmapId != null && values.roadmapId > 0);

        const footerEl = (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={prevStep}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  setCurrentAction("draft");
                  await startDraft(formik.validateForm, values, formik.setFieldError, formik.resetForm);
                  setCurrentAction(null);
                }}
                className="h-11 px-5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                {isSubmitting && currentAction === "draft" ? "Saving…" : "Draft"}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void nextStep(formik.validateForm, values)}
                  className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setCurrentAction("publish");
                    await startPublish(formik.validateForm, values, formik.setFieldError, formik.resetForm);
                    setCurrentAction(null);
                  }}
                  className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {isSubmitting && currentAction === "publish" ? "Publishing…" : "Publish"}
                </button>
              )}
            </div>
          </div>
        );

        return (
          <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            onDiscard={() => handleDiscard(formik.resetForm)}
            title="Create Mentorship Program"
            subtitle={subtitle}
            width={width}
            hasChanges={hasChanges}
            footer={footerEl}
            headerExtra={headerExtra}
          >
            {submitError && (
              <p className="text-sm text-red-600 mb-4 whitespace-pre-wrap" role="alert">
                {submitError}
              </p>
            )}

            {step === 1 && <ProgramBasicsStep />}

            {step === 2 && <ProgramRequirementsStep />}

            {step === 3 && <ProgramQuestionsStep />}
          </BaseModal>
        );
      }}
    </Formik>
  );
}
