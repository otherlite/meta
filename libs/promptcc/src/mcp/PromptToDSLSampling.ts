import { DSLRoot, DSLNode } from "./types";

interface LLMProvider {
  generate: (prompt: string) => Promise<string>;
}

export class PromptToDSLSampling {
  private llmProvider: LLMProvider;

  constructor(llmProvider: LLMProvider) {
    this.llmProvider = llmProvider;
  }

  async parsePrompt(promptMarkdown: string): Promise<DSLRoot> {
    // 提取装饰器内容
    const decoratorPattern = /@(\w+)(?:\s*\((.*?)\))?\s*\n([\s\S]*?)(?=\n@|$)/g;
    const decorators: Record<string, DSLNode[]> = {};

    let match;
    while ((match = decoratorPattern.exec(promptMarkdown)) !== null) {
      const decoratorType = match[1];
      const paramsString = match[2] || "";
      const content = match[3].trim();

      if (!decorators[decoratorType]) {
        decorators[decoratorType] = [];
      }

      // 解析参数
      const params = this.parseParams(paramsString);

      // 解析内容项
      const items = this.parseContent(content, decoratorType);

      items.forEach((item) => {
        decorators[decoratorType].push({
          type: "definition",
          decorator: decoratorType,
          name: item.name,
          params: { ...params, ...item.params },
        });
      });
    }

    // 如果没有 LLM 提供者，返回基础解析结果
    if (!this.llmProvider) {
      return this.createDSLRoot(decorators);
    }

    // 使用 LLM 增强解析
    const enhancedDSL = await this.enhanceWithLLM(decorators, promptMarkdown);
    return enhancedDSL;
  }

  private parseParams(paramsString: string): Record<string, any> {
    const params: Record<string, any> = {};

    if (!paramsString) return params;

    const paramPattern = /(\w+)\s*:\s*([^,)]+)/g;
    let paramMatch;

    while ((paramMatch = paramPattern.exec(paramsString)) !== null) {
      const [, key, value] = paramMatch;
      params[key] = this.parseValue(value.trim());
    }

    return params;
  }

  private parseContent(
    content: string,
    decoratorType: string
  ): Array<{ name: string; params: Record<string, any> }> {
    const lines = content.split("\n").filter((line) => line.trim());
    const items: Array<{ name: string; params: Record<string, any> }> = [];

    let currentItem: {
      name: string;
      params: Record<string, any>;
    } | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("-")) {
        // 新项目
        if (currentItem) {
          items.push(currentItem);
        }

        const itemMatch = trimmedLine.match(/^-\s*(\w+)(?:\s*\(([^)]+)\))?/);
        if (itemMatch) {
          const [, name, paramsStr] = itemMatch;
          currentItem = {
            name,
            params: paramsStr ? this.parseParamString(paramsStr) : {},
          };
        }
      } else if (trimmedLine.startsWith("  -") && currentItem) {
        // 子项目或属性
        const subMatch = trimmedLine.match(/^\s*-\s*(\w+)\s*:\s*(.+)/);
        if (subMatch) {
          const [, key, value] = subMatch;
          currentItem.params[key] = this.parseValue(value.trim());
        }
      } else if (trimmedLine.includes(":") && currentItem) {
        // 键值对
        const [key, ...valueParts] = trimmedLine.split(":");
        if (key.trim() && valueParts.length > 0) {
          currentItem.params[key.trim()] = this.parseValue(
            valueParts.join(":").trim()
          );
        }
      }
    }

    if (currentItem) {
      items.push(currentItem);
    }

    return items;
  }

  private parseParamString(paramStr: string): Record<string, any> {
    const params: Record<string, any> = {};
    const pairs = paramStr.split(",").map((p) => p.trim());

    for (const pair of pairs) {
      const [key, value] = pair.split("=").map((s) => s.trim());
      if (key && value !== undefined) {
        params[key] = this.parseValue(value);
      }
    }

    return params;
  }

  private parseValue(value: string): any {
    // 尝试解析为 JSON
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
        // 如果不是有效的 JSON，返回字符串
      }
    }

    // 布尔值
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    // 数字
    if (!isNaN(Number(value)) && value.trim() !== "") {
      return Number(value);
    }

    // 默认返回字符串
    return value.replace(/^['"]|['"]$/g, "");
  }

  private createDSLRoot(decorators: Record<string, DSLNode[]>): DSLRoot {
    return {
      version: "1.0.0",
      metadata: {
        source: "prompt.md",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      decorators,
      imports: [
        "import { useState, useEffect, useCallback, useMemo } from 'react';",
        "import { useAtom } from 'jotai';",
        "import { atom } from 'jotai';",
      ],
      exports: ["useDSL", "ComponentProps", "UseDSLReturn"],
    };
  }

  private async enhanceWithLLM(
    basicDecorators: Record<string, DSLNode[]>,
    originalPrompt: string
  ): Promise<DSLRoot> {
    const prompt = `
      你是一个 DSL 专家。请分析以下 Prompt.md 内容，将其转换为结构化的 DSL JSON。

      原始内容：
      ${originalPrompt}

      基础解析结果：
      ${JSON.stringify(basicDecorators, null, 2)}

      请完善以下内容：
      1. 补充缺失的类型定义
      2. 推断合理的默认值
      3. 添加适当的依赖关系
      4. 生成完整的 UI 组件结构
      5. 确保符合 React + Jotai 的最佳实践

      返回完整的 DSL JSON 结构，包括：
      - version
      - metadata
      - decorators (每个装饰器的完整节点)
      - imports
      - exports
    `;

    try {
      const response = await this.llmProvider.generate(prompt);
      const enhancedDSL = JSON.parse(response);

      // 验证并合并结果
      return {
        ...this.createDSLRoot({}),
        ...enhancedDSL,
        decorators: {
          ...basicDecorators,
          ...enhancedDSL.decorators,
        },
      };
    } catch (error) {
      console.warn("LLM enhancement failed, using basic parsing:", error);
      return this.createDSLRoot(basicDecorators);
    }
  }
}
