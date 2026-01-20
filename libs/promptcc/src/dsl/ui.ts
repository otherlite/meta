import { z } from "zod";

export interface UISchemaNode {
  type: string;
  id?: string;
  props?: Record<string, any>;
  children?: UISchemaNode[];
  bindings?: Record<string, any>;
  events?: Record<string, string>;
  conditions?: Record<string, any>;
}

export const UISchema: z.ZodType<UISchemaNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    id: z.string().optional(),
    props: z.record(z.any()).optional(),
    children: z.array(UISchema).optional(),
    bindings: z.record(z.any()).optional(),
    events: z.record(z.string()).optional(),
    conditions: z.record(z.any()).optional(),
  }),
);
