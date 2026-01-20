import { z } from "zod";

// @effect 装饰器
export const EffectSchema = z.object({
  name: z.string(),
  deps: z.array(z.string()),
  run: z.string(),
  cleanup: z.string().optional(),
  description: z.string().optional(),
});
