
import { z } from "zod";

/** Matches backend `AnswerType` enum names for `Enum.TryParse`. */
const programAnswerTypeSchema = z.enum([
  "Paragraph",
  "MultipleChoice",
  "TrueFalse",
]);

/** Backend `ExperienceLevel`: None = 1 … Advanced = 4 */
const technologyRequirementSchema = z.object({
  technologyId: z.number().int().positive(),
  requiredExperienceLevel: z
    .number()
    .int()
    .min(1, "Select a valid experience level")
    .max(4),
});

const questionSchema = z
  .object({
    programQuestionId: z.number().optional(),

    /** Allow temporary empty input rows in UI */
    questionText: z.string().default(""),

    /** Allow temporary empty state before validation */
    answerType: z
      .union([
        programAnswerTypeSchema,
        z.literal(""),
      ])
      .default("Paragraph"),

    maxSelections: z.number().nullable().optional(),

    options: z.array(z.string()).optional(),
  })
  .superRefine((q, ctx) => {
    const text = q.questionText.trim();

    // Completely empty row => ignore safely
    if (
      text.length === 0 &&
      (!q.options ||
        q.options.every(
          (o) => !String(o).trim()
        ))
    ) {
      return;
    }

    // Partial question validation - only if there's some content
    if (text.length > 0 && text.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionText"],
        message:
          "Question text must be at least 3 characters",
      });
    }

    // Prevent invalid temporary answerType
    if (
      q.answerType === ""
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answerType"],
        message:
          "Please select a valid answer type",
      });
    }

    // NOTE: MCQ option validation moved to submit-time
    // This allows drafts with incomplete MCQ rows without blocking form submission
  });

export const getCreateProgramSchema = (isEditMode: boolean, initialDeadline?: string) => z
  .object({
    domainId: z.coerce
      .number()
      .min(
        1,
        "Please select a domain"
      ),

    subDomainId: z.coerce
      .number()
      .min(
        1,
        "Please select a sub-domain"
      ),

    title: z
      .string()
      .trim()
      .min(
        3,
        "Title must be at least 3 characters"
      )
      .max(
        100,
        "Title must be at most 100 characters"
      ),

    description: z
      .string()
      .trim()
      .min(
        20,
        "Description must be at least 20 characters"
      )
      .max(
        1000,
        "Description must be at most 1000 characters"
      ),

    educationLevel:
      z.coerce
        .number()
        .min(
          1,
          "Select the mentee education stage"
        ),

    targetLevel:
      z.coerce
        .number()
        .min(
          1,
          "Select the minimum skill level you expect"
        ),

    capacity: z.coerce
      .number()
      .min(
        1,
        "Capacity must be at least 1"
      )
      .max(
        1000,
        "Capacity cannot exceed 1000"
      ),

    duration: z
      .union([z.string(), z.number()])
      .optional(),

    availability:
      z.string().optional(),
      
technologies: z
  .array(technologyRequirementSchema)
  .min(
    1,
    "Please select at least one technology"
  ),
    /** Optional roadmap */
    roadmapId: z
      .union([
        z.coerce.number(),
        z.null(),
      ])
      .optional(),

    /** Optional; never sent to Create Program API. */
    image: z
      .custom<
        File | undefined
      >(
        (val) =>
          val ===
            undefined ||
          val instanceof File
      )
      .optional(),

deadline: z
  .string()
  .min(1, "Please select an application deadline"),

    questions: z
      .array(
        questionSchema
      )
      .default([]),

    /** Populated in edit mode only — not sent to create API */
    existingImageUrl: z.string().optional(),

    /** Populated in edit mode only — preserves publish state on save */
    programStatus: z.number().optional(),
  })
  .superRefine(
    (data, ctx) => {
      const seen =
        new Set<number>();

      data.technologies.forEach(
        (
          row,
          index
        ) => {
          if (
            seen.has(
              row.technologyId
            )
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode
                .custom,
              path: [
                "technologies",
                index,
                "technologyId",
              ],
              message:
                "Each technology can only appear once.",
            });
          }

          seen.add(
            row.technologyId
          );
        }
      );

      // Validate deadline only if we are not in edit mode with an unchanged deadline
      if (data.deadline) {
        const selectedDate = new Date(data.deadline);
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (isEditMode && initialDeadline && data.deadline === initialDeadline) {
          // If editing and the deadline hasn't changed, skip validation
          return;
        }

        if (selectedDate <= today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["deadline"],
            message: "Please choose a future application deadline",
          });
        }
      }
    }
  );

