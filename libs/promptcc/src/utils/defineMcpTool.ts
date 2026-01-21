import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp";
import {
  AnySchema,
  ZodRawShapeCompat,
} from "@modelcontextprotocol/sdk/server/zod-compat";
import { ToolAnnotations } from "@modelcontextprotocol/sdk/types";

export function defineMcpTool<
  OutputArgs extends ZodRawShapeCompat | AnySchema,
  InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined
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
  handler: ToolCallback<InputArgs>;
}) {
  return tool;
}
