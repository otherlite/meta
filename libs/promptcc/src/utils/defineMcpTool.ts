import type { PromptCallback } from "@modelcontextprotocol/sdk/server/mcp";
import { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat";

export function defineMcpTool<TSchema extends ZodRawShapeCompat>(tool: {
  name: string;
  config: {
    title: string;
    description: string;
    argsSchema: TSchema;
  };
  handler: PromptCallback<TSchema>;
}) {
  return tool;
}
