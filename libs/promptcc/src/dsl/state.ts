import { z } from "zod";

/** 基础字段 */
const BaseState = {
  name: z.string(),
  description: z.string().optional(),
  optional: z.boolean().optional(),
  defaultValue: z.any().optional(),
};

/** StateSchema */
export const StateSchema: z.ZodType<StateNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    // 原生类型
    z.object({
      ...BaseState,
      type: z.literal("string"),
      defaultValue: z.string().optional(),
    }),
    z.object({
      ...BaseState,
      type: z.literal("number"),
      defaultValue: z.number().optional(),
    }),
    z.object({
      ...BaseState,
      type: z.literal("boolean"),
      defaultValue: z.boolean().optional(),
    }),
    // 自定义类型
    z.object({
      ...BaseState,
      type: z.literal("custom"),
      schema: z.array(StateSchema), // recursive
      defaultValue: z.record(z.any()).optional(), // 可以为空或部分字段
    }),
  ]),
);

/* TypeScript 类型 */
export type StateNode =
  | { type: "string"; name: string; defaultValue?: string }
  | { type: "number"; name: string; defaultValue?: number }
  | { type: "boolean"; name: string; defaultValue?: boolean }
  | CustomNode<StateNode[]>;

/** CustomNode */
export type CustomNode<S extends StateNode[]> = {
  type: "custom";
  name: string;
  schema: S;
  defaultValue?: SchemaToDefault<S>;
};

// Recursive 映射 schema -> defaultValue 类型
export type SchemaToDefault<T extends StateNode[]> = {
  [K in T[number] as K["name"]]?: K extends CustomNode<infer S>
    ? SchemaToDefault<S>
    : K extends { defaultValue?: infer V }
    ? V
    : never;
};
