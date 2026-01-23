import { z } from "zod";
import { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat";
import { ToolAnnotations } from "@modelcontextprotocol/sdk/types";

type IsZodOptional<T> = T extends z.ZodOptional<any> ? true : false;

type UnwrapZod<T> = T extends z.ZodOptional<infer U>
  ? UnwrapZod<U>
  : T extends z.ZodDefault<infer U>
  ? UnwrapZod<U>
  : T;

type InferField<T> = T extends z.ZodTypeAny ? z.infer<UnwrapZod<T>> : unknown;

export type InferRawShape<T extends ZodRawShapeCompat> =
  // 必填字段
  {
    [K in keyof T as IsZodOptional<T[K]> extends true ? never : K]: InferField<
      T[K]
    >;
  } &
    // 可选字段
    {
      [K in keyof T as IsZodOptional<T[K]> extends true
        ? K
        : never]?: InferField<T[K]>;
    };

type SendResultT<T extends ZodRawShapeCompat> = {
  content: Record<string, string>[];
  structuredContent: InferRawShape<T>;
};

export function defineMcpTool<
  OutputArgs extends ZodRawShapeCompat,
  InputArgs extends ZodRawShapeCompat
>(tool: {
  name: string;
  config: {
    title?: string;
    description?: string;
    inputSchema?: InputArgs;
    outputSchema?: OutputArgs;
    annotations?: ToolAnnotations;
    _meta?: Record<string, unknown>;
  };
  handler: (
    args: InferRawShape<InputArgs>,
  ) => SendResultT<OutputArgs> | Promise<SendResultT<OutputArgs>>;
}) {
  return tool;
}
