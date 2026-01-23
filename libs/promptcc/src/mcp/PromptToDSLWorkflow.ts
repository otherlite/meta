import { defineMcpTool } from "utils/defineMcpTool";
import { z } from "zod";

export default defineMcpTool({
  name: "PromptToDSLWorkflow",
  config: {
    title: "PromptToDSLWorkflow",
    description:
      "将用户输入的prompt转换为DSL.json、useDSL.ts文件，DSL.json文件包含prompt的元数据和状态定义，useDSL.ts文件包含prompt的状态使用代码",
    inputSchema: {
      filePath: z.string().describe("需要转换的prompt文件路径"),
    },
    outputSchema: {
      success: z.boolean(),
      filePath: z.string().describe("生成的DSL.json文件路径"),
      template: z.string().describe("生成的useDSL.ts文件路径").optional(),
      description: z.string().optional(),
      errorMessage: z.string().optional(),
    },
  },
  handler: async ({ filePath }) => {
    try {
      const template = `# 智能 Prompt 转换 DSL 

复制${filePath}，新文件后缀改为.ts
`;

      return {
        content: [
          {
            type: "text",
            text: `✅ 智能 Prompt 转换 DSL 工具调用成功

目标文件: ${filePath}
Prompt: ${template}

`,
          },
        ],
        structuredContent: {
          success: true,
          filePath,
          template,
          description: "引导 AI 完成从 Prompt.md 转换到 DSL 流程",
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ 智能 Prompt 转换 DSL 工具调用失败：${errorMessage}`,
          },
        ],
        structuredContent: {
          success: false,
          filePath,
          errorMessage,
        },
      };
    }
  },
});
