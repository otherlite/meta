import { z } from "zod";

// JsonLogic 类型
export type JsonLogicExpression = any;

// 状态定义
export const StateDefinitionSchema = z.object({
  name: z.string(),
  defaultValue: z.any(),
  description: z.string().optional(),
});

export type StateDefinition = z.infer<typeof StateDefinitionSchema>;

// 事件定义
export const EventDefinitionSchema = z.object({
  name: z.string(),
  parameters: z.record(z.any()).optional(),
  description: z.string().optional(),
});

export type EventDefinition = z.infer<typeof EventDefinitionSchema>;

// 效果定义
export const EffectDefinitionSchema = z.object({
  name: z.string(),
  type: z.enum(["async", "debounce", "throttle"]),
  triggerEvent: z.string(),
  mcpTool: z.string(),
  parameters: z.record(z.any()),
  onSuccess: z
    .array(
      z.object({
        type: z.enum(["setState", "triggerEvent"]),
        target: z.string(),
        value: JsonLogicSchema.optional(),
      })
    )
    .optional(),
  onFailure: z
    .array(
      z.object({
        type: z.enum(["setState", "triggerEvent"]),
        target: z.string(),
        value: JsonLogicSchema.optional(),
      })
    )
    .optional(),
  debounceMs: z.number().optional(),
});

export type EffectDefinition = z.infer<typeof EffectDefinitionSchema>;

// 派生状态定义
export const DerivedStateDefinitionSchema = z.object({
  name: z.string(),
  expression: JsonLogicSchema,
  dependencies: z.array(z.string()).optional(),
});

export type DerivedStateDefinition = z.infer<
  typeof DerivedStateDefinitionSchema
>;

// 视图组件定义
export const ViewComponentSchema = z.object({
  id: z.string(),
  type: z.string(), // 组件类型，对应 MCP Tool
  props: z.record(z.any()),
  children: z.array(z.lazy(() => ViewComponentSchema)).optional(),
  events: z.record(z.string()).optional(), // 组件事件 -> 状态机事件
  bindings: z.record(JsonLogicSchema).optional(), // 属性绑定表达式
});

export type ViewComponent = z.infer<typeof ViewComponentSchema>;

// 完整的 DSL 定义
export const DSLDefinitionSchema = z.object({
  metadata: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
  }),
  states: z.array(StateDefinitionSchema),
  events: z.array(EventDefinitionSchema),
  effects: z.array(EffectDefinitionSchema),
  derivedStates: z.array(DerivedStateDefinitionSchema),
  view: z.array(ViewComponentSchema),
  imports: z.record(z.string()).optional(), // 需要导入的 MCP Tools
});

export type DSLDefinition = z.infer<typeof DSLDefinitionSchema>;

// JsonLogic Schema
export const JsonLogicSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.lazy(() => JsonLogicSchema)),
  z.record(z.lazy(() => JsonLogicSchema)),
  z.object({
    operator: z.string(),
    values: z.array(z.lazy(() => JsonLogicSchema)),
  }),
]);

// 状态机上下文
export interface MachineContext {
  states: Record<string, any>;
  derivedStates: Record<string, any>;
  effects: Record<string, EffectDefinition>;
  dispatch: (event: string, payload?: any) => void;
}

// MCP Tool 调用
export interface McpToolCall {
  tool: string;
  parameters: Record<string, any>;
}

// 页面 MCP Tool 定义
export interface PageMcpTool {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  execute: (params: any, context: MachineContext) => Promise<any>;
}

// 渲染结果
export interface RenderResult {
  component: React.ComponentType;
  props: Record<string, any>;
  children?: RenderResult[];
}
