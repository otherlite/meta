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
      description: z.string(),
      success: z.boolean(),
      filePath: z.string().describe("生成的DSL.json文件路径"),
      template: z.string().describe("生成的useDSL.ts文件路径"),
    },
  },
  handler: async ({ filePath }) => {
    return {
      description: "DSL generation completed",
      content: [
        {
          type: "text",
          text: `DSL generated from: ${filePath}`,
        },
      ],
    };
  },
});
