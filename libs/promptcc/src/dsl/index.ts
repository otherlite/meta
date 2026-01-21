import { z } from "zod";
import { StateSchema } from "./state";

export const DSLSchema = z.object({
  metadata: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
    source: z.string().optional(),
  }),

  state: z.array(StateSchema).optional(),
});

export type DSLAST = z.infer<typeof DSLSchema>;
