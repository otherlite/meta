import { defineMcpTool } from "utils/defineMcpTool";
import { z } from "zod";
import { DSLSchema } from "dsl";

const getInstructions = ({ filePath }: { filePath: string }) => {
  return `
## 智能 Prompt 转换 DSL 工作流指令

专门用于将声明式 UI 状态管理语法转换为结构化 DSL 和对应代码。

### 📋 你的 Prompt.md 格式说明
你的文件使用以下格式：
1. 标签: @state
2. 条件: 自然语言描述，如"input 和 date 都不为空"
3. UI绑定: 中文描述，如"绑定 input"

### 🎯 LLM 需要执行的任务

**你的任务是：**
1. 读取文件内容
2. 理解这个特定格式
3. 转换为结构化 JSON
4. 验证和生成代码

### 📝 DSL 输出结构规则（必须严格遵守）

${JSON.stringify(DSLSchema.toJSONSchema(), null, 2)}

### 🚀 执行步骤（请严格执行，不要其他额外的操作）

**步骤 1: 读取文件**
获取 ${filePath} 的内容

**步骤 2: 逐行分析**
按照上述规则，将每一部分转换为结构化数据

**步骤 3: 构建完整 DSL**
组合成完整的 JSON 结构

**步骤 4: 验证**
调用 DSLValidate 验证结果

**步骤 5: 生成代码**
调用 DSLCodeGen 生成代码文件

### ⚠️ 注意事项
1. 保持原始语义不变
2. 类型转换要准确（字符串→string，日期→Date）
3. 自然语言条件转换为 JavaScript 表达式
4. 确保所有绑定关系正确
5. 不要添加原始文件没有的内容
`;
};

export default defineMcpTool({
  name: "PromptToDSLWorkflow",
  config: {
    title: "PromptToDSLWorkflow",
    description: "将用户输入的 prompt.md 转换为 dsl.json",
    inputSchema: z.object({
      filePath: z.string().describe("需要转换的 prompt.md 文件路径"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      filePath: z.string().describe("需要转换的 prompt.md 文件路径").optional(),
      description: z.string().optional(),
      instructions: z.string().optional(),
      error: z.string().optional(),
      suggestions: z.array(z.string()).optional(),
    }),
  },
  handler: async ({ filePath }) => {
    try {
      const instructions = getInstructions({ filePath });
      return {
        content: [
          {
            type: "text",
            text: `
✅ 智能 Prompt 转换 DSL 工作流调用成功
目标文件: ${filePath}
Prompt: ${instructions}
`,
          },
        ],
        structuredContent: {
          success: true,
          filePath,
          description: "引导 AI 完成从 Prompt.md 转换到 DSL 工作流",
          instructions,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `❌ 智能 Prompt 转换 DSL 工作流调用失败：${errorMessage}`,
          },
        ],
        structuredContent: {
          success: false,
          instructions: `请检查文件路径是否正确: ${filePath}`,
          error: errorMessage,
          suggestions: [
            "确认文件路径存在且可访问",
            "检查文件权限",
            "确保是 .md 格式文件",
            "如果路径包含中文或特殊字符，请确保正确编码",
          ],
        },
      };
    }
  },
});
