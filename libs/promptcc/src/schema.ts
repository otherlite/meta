import { z } from "zod";

export const StateDefSchema = z.object({
  type: z.enum(["string", "number", "boolean", "object", "array"]),
  default: z.any(),
  description: z.string().optional(),
});

export const ActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("set"),
    state: z.string(),
    value: z.any(),
  }),
  z.object({
    type: z.literal("call"),
    action: z.string(),
    args: z.record(z.any()).optional(),
  }),
  z.object({
    type: z.literal("emit"),
    event: z.string(),
    payload: z.any().optional(),
  }),
]);

export const AsyncActionSchema = z.object({
  mcp: z.string(),
  operation: z.string(),
  args: z.record(z.any()).optional(),
  onSuccess: z.array(ActionSchema),
  onError: z.array(ActionSchema),
  debounce: z.number().optional(),
  throttle: z.number().optional(),
});

export const UIComponentSchema = z.object({
  component: z.string(),
  props: z.record(z.any()).optional(),
  children: z.array(z.lazy(() => UIComponentSchema)).optional(),
  condition: z.string().optional(),
});

export const DSLSchema = z.object({
  name: z.string(),
  states: z.record(StateDefSchema),
  computed: z.record(z.string()).optional(),
  handlers: z.record(z.array(ActionSchema)).optional(),
  actions: z.record(AsyncActionSchema).optional(),
  ui: z.array(UIComponentSchema),
});
