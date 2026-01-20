import { z } from "zod";

// @callback 装饰器
export const CallbackSchema = z.object({
  name: z.string(),
  params: z.array(z.string()).optional(),
  body: z.string(),
  async: z.boolean().optional().default(false),
  description: z.string().optional(),
});
