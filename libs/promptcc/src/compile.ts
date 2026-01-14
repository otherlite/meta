// packages/compiler/src/index.ts
import { DSL } from "./types";
import { DSLSchema } from "./schema";
import { validateDSL } from "./validator";
import { generateTypeScript } from "./codegen";

export class Compiler {
  constructor(
    private llmAdapter: LLMAdapter,
    private options: CompilerOptions = {}
  ) {}

  async compile(markdown: string): Promise<CompileResult> {
    // 1. 提取 Prompt.md 中的各个部分
    const sections = this.extractSections(markdown);

    // 2. 调用 LLM 生成 DSL
    const dsl = await this.generateDSL(sections);

    // 3. 验证 DSL
    const validation = validateDSL(dsl);
    if (!validation.valid) {
      throw new Error(`DSL 验证失败: ${validation.errors?.join(", ")}`);
    }

    // 4. 生成 TypeScript 代码
    const typescript = generateTypeScript(dsl);

    return {
      dsl,
      typescript,
      warnings: validation.warnings,
    };
  }

  private extractSections(markdown: string): PromptSections {
    const sections: PromptSections = {
      states: [],
      computed: [],
      handlers: [],
      actions: [],
      ui: [],
    };

    let currentSection = "";
    const lines = markdown.split("\n");

    for (const line of lines) {
      // 检测章节标题
      if (line.startsWith("# ")) {
        const title = line.substring(2).toLowerCase();
        if (title.includes("状态")) currentSection = "states";
        else if (title.includes("计算") || title.includes("派生"))
          currentSection = "computed";
        else if (title.includes("事件")) currentSection = "handlers";
        else if (title.includes("操作") || title.includes("effect"))
          currentSection = "actions";
        else if (title.includes("界面") || title.includes("ui"))
          currentSection = "ui";
        else currentSection = "";
        continue;
      }

      // 跳过空行和注释
      if (!line.trim() || line.trim().startsWith("//")) continue;

      // 根据当前章节处理内容
      switch (currentSection) {
        case "states":
          sections.states.push(line.trim());
          break;
        case "computed":
          sections.computed.push(line.trim());
          break;
        case "handlers":
          sections.handlers.push(line.trim());
          break;
        case "actions":
          sections.actions.push(line.trim());
          break;
        case "ui":
          sections.ui.push(line.trim());
          break;
      }
    }

    return sections;
  }

  private async generateDSL(sections: PromptSections): Promise<DSL> {
    const prompt = this.buildPrompt(sections);
    const result = await this.llmAdapter.generate(prompt);

    // 尝试解析 JSON
    try {
      const dsl = JSON.parse(result);
      return DSLSchema.parse(dsl);
    } catch (error) {
      // 如果解析失败，尝试提取 JSON
      const jsonMatch =
        result.match(/```json\n([\s\S]*?)\n```/) || result.match(/{[\s\S]*}/);

      if (jsonMatch) {
        try {
          const dsl = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          return DSLSchema.parse(dsl);
        } catch (e) {
          throw new Error(`无法解析 LLM 返回的 JSON: ${e}`);
        }
      }

      throw new Error("LLM 没有返回有效的 JSON");
    }
  }

  private buildPrompt(sections: PromptSections): string {
    return `# DSL 生成任务

请将以下自然语言描述转换为结构化 DSL。

## 状态定义
${sections.states.join("\n")}

## 计算属性
${sections.computed.join("\n")}

## 事件处理器
${sections.handlers.join("\n")}

## 异步操作
${sections.actions.join("\n")}

## 界面描述
${sections.ui.join("\n")}

请生成符合以下 JSON Schema 的 DSL：

\`\`\`json
{
  "name": "string",
  "states": {
    "stateName": {
      "type": "string | number | boolean | object | array",
      "default": "any"
    }
  },
  "computed": {
    "computedName": "表达式字符串，可引用状态，如：!isLoading && userInput.length > 0"
  },
  "handlers": {
    "handlerName": [
      { "type": "set", "state": "stateName", "value": "any" },
      { "type": "call", "action": "actionName", "args": { "arg1": "value" } }
    ]
  },
  "actions": {
    "actionName": {
      "mcp": "MCP名称",
      "operation": "操作名称",
      "args": { "参数": "值" },
      "onSuccess": [{ "type": "set", "state": "stateName", "value": "$result" }],
      "onError": [{ "type": "set", "state": "error", "value": "$error" }]
    }
  },
  "ui": [
    {
      "component": "组件名称",
      "props": {
        "propName": "值或 $state.stateName 或 $computed.computedName"
      }
    }
  ]
}
\`\`\`

请只返回 JSON，不要有其他内容。`;
  }
}

export interface CompilerOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export interface PromptSections {
  states: string[];
  computed: string[];
  handlers: string[];
  actions: string[];
  ui: string[];
}

export interface CompileResult {
  dsl: DSL;
  typescript: string;
  warnings?: string[];
}
