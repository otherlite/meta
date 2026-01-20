import { z } from "zod";
import { SearchParamSchema } from "./searchParam";
import { StateSchema } from "./state";
import { MemoSchema } from "./memo";
import { CallbackSchema } from "./callback";
import { EffectSchema } from "./effect";
import { uiSchema } from "./ui";

export const DSLSchema = z.object({
  metadata: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
    source: z.string().optional(),
  }),

  searchParams: z.array(SearchParamSchema).optional(),
  state: z.array(StateSchema).optional(),
  memo: z.array(MemoSchema).optional(),
  callback: z.array(CallbackSchema).optional(),
  effect: z.array(EffectSchema).optional(),
  ui: z.array(uiSchema).optional(),
  ui2: z.array(uiSchema).optional(),

  // 自定义装饰器存储
  customDecorators: z.record(z.any()).optional(),

  // 类型定义
  types: z
    .array(
      z.object({
        name: z.string(),
        definition: z.any(),
      }),
    )
    .optional(),
});

export type DSLAST = z.infer<typeof DSLASTSchema>;
