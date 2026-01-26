import { z } from "zod";
import { ToolAnnotations } from "@modelcontextprotocol/sdk/types";

export type HandleResult<T extends z.ZodObject> = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: z.infer<T>;
};

export function defineMcpTool<
  OutputArgs extends z.ZodObject,
  InputArgs extends z.ZodObject
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
    args: z.infer<InputArgs>,
  ) => HandleResult<OutputArgs> | Promise<HandleResult<OutputArgs>>;
}) {
  return tool;
}
