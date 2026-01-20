import { z } from "zod";

// @memo 装饰器 (派生状态)
export const MemoSchema = z.object({
  name: z.string(),
  deps: z.array(z.string()),
  compute: z.string(), // 计算表达式
  description: z.string().optional(),
});
