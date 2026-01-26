import { DSLSchema } from "dsl";
import { defineMcpTool } from "utils/defineMcpTool";
import { z } from "zod";

export default defineMcpTool({
  name: "DSLValidateTool",
  config: {
    title: "DSLValidateTool",
    description: "验证 DSL 是否符合规范",
    inputSchema: z.object({
      dsl: z.string().describe("需要验证的 DSL 序列化内容"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      description: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  handler: async ({ dsl }) => {
    try {
      DSLSchema.parse(JSON.parse(dsl));
      return {
        content: [
          {
            type: "text",
            text: `验证 DSL 符合规范`,
          },
        ],
        structuredContent: {
          success: true,
          description: "验证 DSL 符合规范",
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof z.ZodError
          ? JSON.stringify(error.issues)
          : String(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ 验证 DSL 不符合规范：${errorMessage}`,
          },
        ],
        structuredContent: {
          success: false,
          error: errorMessage,
        },
      };
    }
  },
});
