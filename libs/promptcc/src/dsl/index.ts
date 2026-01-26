import { z } from "zod";
import { StateSchema } from "./state";

export const DSLSchema = z.object({
  state: z.array(StateSchema).optional(),
});

export type DSLAst = z.infer<typeof DSLSchema>;
