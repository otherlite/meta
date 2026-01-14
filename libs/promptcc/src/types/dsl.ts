import { z } from "zod";

// 基础类型
export type StateId = string;
export type EventId = string;
export type EffectId = string;
export type MCPId = string;
export type ComponentId = string;

// JsonLogic 表达式类型
export type JsonLogicExpression = any;

// MCP 操作参数定义
export const MCPOperationParamsSchema = z.record(z.string(), z.any());

// 状态定义
export const StateDefinitionSchema = z.object({
  id: z.string(),
  defaultValue: z.any(),
  description: z.string().optional(),
});

export type StateDefinition = z.infer<typeof StateDefinitionSchema>;

// 事件定义
export const EventDefinitionSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  triggers: z.array(z.string()).optional(), // effect IDs
});

export type EventDefinition = z.infer<typeof EventDefinitionSchema>;

// 效果定义
export const EffectDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(["async", "debounce", "sync"]),
  debounceMs: z.number().optional(),
  action: z.object({
    mcp: z.string(),
    operation: z.string(),
    parameters: MCPOperationParamsSchema,
  }),
  onSuccess: z.array(z.string()).optional(), // event IDs
  onFailure: z.array(z.string()).optional(), // event IDs
  dependsOn: z.array(z.string()).optional(), // state IDs this effect depends on
});

export type EffectDefinition = z.infer<typeof EffectDefinitionSchema>;

// 状态转移定义
export const StateTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  event: z.string(),
  condition: z.any().optional(), // JsonLogic expression
});

export type StateTransition = z.infer<typeof StateTransitionSchema>;

// 派生状态定义
export const DerivedStateDefinitionSchema = z.object({
  id: z.string(),
  logic: z.any(), // JsonLogic expression
  dependencies: z.array(z.string()),
  description: z.string().optional(),
  cache: z.boolean().default(true),
});

export type DerivedStateDefinition = z.infer<
  typeof DerivedStateDefinitionSchema
>;

// MCP 组件属性定义
export const ComponentPropertiesSchema = z.record(z.string(), z.any());

// 组件事件绑定
export const ComponentEventsSchema = z.record(z.string(), z.string()); // eventName -> eventId

// MCP 组件定义
export const ComponentDefinitionSchema = z.object({
  id: z.string(),
  type: z.string(), // MCP type (e.g., "TextFieldMCP", "ButtonMCP")
  properties: ComponentPropertiesSchema,
  children: z.array(z.string()).optional(),
  events: ComponentEventsSchema.optional(),
  layout: z
    .object({
      width: z.number().or(z.string()).optional(),
      height: z.number().or(z.string()).optional(),
      flex: z.number().optional(),
    })
    .optional(),
});

export type ComponentDefinition = z.infer<typeof ComponentDefinitionSchema>;

// 视图定义
export const ViewDefinitionSchema = z.object({
  root: z.string(),
  components: z.record(z.string(), ComponentDefinitionSchema),
});

export type ViewDefinition = z.infer<typeof ViewDefinitionSchema>;

// 页面配置
export const PageConfigSchema = z.object({
  title: z.string().optional(),
  layout: z.enum(["default", "fullscreen", "modal"]).optional(),
  initialStates: z.record(z.string(), z.any()).optional(),
});

export type PageConfig = z.infer<typeof PageConfigSchema>;

// 完整的 DSL 定义
export const DSLSchema = z.object({
  metadata: z.object({
    name: z.string(),
    version: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }),
  config: PageConfigSchema.optional(),
  states: z.array(StateDefinitionSchema),
  events: z.array(EventDefinitionSchema),
  effects: z.array(EffectDefinitionSchema),
  transitions: z.array(StateTransitionSchema).optional(),
  derivedStates: z.array(DerivedStateDefinitionSchema).optional(),
  view: ViewDefinitionSchema,
});

export type DSL = z.infer<typeof DSLSchema>;

// DSL 验证结果
export interface DSLValidationResult {
  success: boolean;
  data?: DSL;
  errors?: string[];
  warnings?: string[];
}
