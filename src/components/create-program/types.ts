import { z } from "zod";
import { createProgramSchema } from "./schema";

export type CreateProgramFormData =
  z.infer<typeof createProgramSchema>;