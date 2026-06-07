import { z } from "zod";
import { getCreateProgramSchema } from "./schema";

export type CreateProgramFormData =
  z.infer<ReturnType<typeof getCreateProgramSchema>>;