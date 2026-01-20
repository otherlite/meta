import { z } from "zod";

// DSL 基础类型
export type DecoratorType =
  | "searchParams"
  | "state"
  | "memo"
  | "callback"
  | "effect"
  | "ui"
  | "ui2"
  | string;

export interface DecoratorParam {
  name: string;
  type: string;
  defaultValue?: any;
  description?: string;
  options?: string[];
}

export interface DecoratorDefinition {
  type: DecoratorType;
  params: DecoratorParam[];
  description?: string;
}

export interface UIComponent {
  type: string;
  bind?: string;
  props?: Record<string, any>;
  children?: UIComponent[];
  event?: Record<string, string>;
  condition?: string;
}

// DSL JSON AST 结构
export interface DSLNode {
  type: string;
  decorator: DecoratorType;
  name: string;
  params: Record<string, any>;
  children?: DSLNode[];
  ui?: UIComponent[];
  [key: string]: any;
}

export interface DSLRoot {
  version: string;
  metadata: {
    source: string;
    createdAt: string;
    updatedAt: string;
  };
  decorators: Record<DecoratorType, DSLNode[]>;
  imports: string[];
  exports: string[];
}

// Zod Schema 用于验证
export const DecoratorParamSchema = z.object({
  name: z.string(),
  type: z.string(),
  defaultValue: z.any().optional(),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export const UIComponentSchema = z.object({
  type: z.string(),
  bind: z.string().optional(),
  props: z.record(z.any()).optional(),
  children: z.array(z.lazy(() => UIComponentSchema)).optional(),
  event: z.record(z.string()).optional(),
  condition: z.string().optional(),
});

export const DSLNodeSchema = z.object({
  type: z.string(),
  decorator: z.string(),
  name: z.string(),
  params: z.record(z.any()),
  children: z.array(z.lazy(() => DSLNodeSchema)).optional(),
  ui: z.array(UIComponentSchema).optional(),
});

export const DSLRootSchema = z.object({
  version: z.string(),
  metadata: z.object({
    source: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  decorators: z.record(z.array(DSLNodeSchema)),
  imports: z.array(z.string()),
  exports: z.array(z.string()),
});

// 自定义装饰器配置
export interface CustomDecoratorConfig {
  name: string;
  schema: z.ZodType<any>;
  codegen: (node: DSLNode) => string;
  imports: string[];
}

// MCP 相关类型
export interface MCPRequest {
  method: string;
  params: Record<string, any>;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}
