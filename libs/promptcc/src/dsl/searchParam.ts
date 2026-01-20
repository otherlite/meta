import { z } from "zod";

// @searchParam 装饰器
export const SearchParamSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean", "array"]),
  defaultValue: z.any().optional(),
  description: z.string().optional(),
});
