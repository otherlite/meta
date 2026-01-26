import { defineMcpTool } from "utils/defineMcpTool";
import { z } from "zod";
import fs from "node:fs";

export default defineMcpTool({
  name: "DSLCodeGenTool",
  config: {
    title: "DSLCodeGenTool",
    description: "将 DSL 转化为代码",
    inputSchema: z.object({
      filePath: z.string().describe("需要转换的 prompt.md 文件路径"),
      dsl: z.string().describe("需要转化的 DSL 序列化内容"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      description: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  handler: async ({ filePath, dsl }) => {
    try {
      fs.writeFileSync(filePath.replace("prompt.md", "dsl.json"), dsl);
      return {
        content: [
          {
            type: "text",
            text: `DSL 转化代码成功`,
          },
        ],
        structuredContent: {
          success: true,
          description: "DSL 转化代码成功",
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ DSL 转化代码失败：${errorMessage}`,
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
