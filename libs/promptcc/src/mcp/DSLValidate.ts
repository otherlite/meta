import { z } from "zod";
import {
  DSLRootSchema,
  DSLNodeSchema,
  UIComponentSchema,
  CustomDecoratorConfig,
} from "./types";

export class DSLValidator {
  private customValidators: Map<string, z.ZodType<any>> = new Map();

  constructor(private customDecorators: CustomDecoratorConfig[] = []) {
    // 注册自定义装饰器验证器
    customDecorators.forEach((decorator) => {
      this.customValidators.set(decorator.name, decorator.schema);
    });
  }

  validateDSL(dsl: any): { valid: boolean; errors: string[]; data?: any } {
    const errors: string[] = [];

    try {
      // 基础结构验证
      const result = DSLRootSchema.safeParse(dsl);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push(`[${issue.path.join(".")}]: ${issue.message}`);
        });
        return { valid: false, errors };
      }

      // 验证每个装饰器
      const validatedDecorators: Record<string, any> = {};

      for (const [decoratorType, nodes] of Object.entries(
        dsl.decorators || {}
      )) {
        const validator =
          this.customValidators.get(decoratorType) || DSLNodeSchema;

        for (let i = 0; i < nodes.length; i++) {
          const nodeResult = validator.safeParse(nodes[i]);
          if (!nodeResult.success) {
            nodeResult.error.issues.forEach((issue) => {
              errors.push(
                `[${decoratorType}[${i}].${issue.path.join(".")}]: ${
                  issue.message
                }`
              );
            });
          }
        }
      }

      // 验证 UI 组件
      const validateUIComponents = (components: any[], path: string = "ui") => {
        for (let i = 0; i < components.length; i++) {
          const uiResult = UIComponentSchema.safeParse(components[i]);
          if (!uiResult.success) {
            uiResult.error.issues.forEach((issue) => {
              errors.push(
                `[${path}[${i}].${issue.path.join(".")}]: ${issue.message}`
              );
            });
          }

          // 递归验证子组件
          if (components[i].children) {
            validateUIComponents(
              components[i].children,
              `${path}[${i}].children`
            );
          }
        }
      };

      // 遍历所有 UI 装饰器
      Object.entries(dsl.decorators || {}).forEach(
        ([decoratorType, nodes]: [string, any]) => {
          if (decoratorType.startsWith("ui")) {
            nodes.forEach((node: any, nodeIndex: number) => {
              if (node.ui) {
                validateUIComponents(
                  node.ui,
                  `decorators.${decoratorType}[${nodeIndex}].ui`
                );
              }
            });
          }
        }
      );

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      return { valid: true, errors: [], data: result.data };
    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
      return { valid: false, errors };
    }
  }

  async validateWithLLM(
    dsl: any,
    llmProvider: (prompt: string) => Promise<string>
  ): Promise<{ valid: boolean; errors: string[]; correctedDSL?: any }> {
    const validation = this.validateDSL(dsl);

    if (validation.valid) {
      return validation;
    }

    // 如果验证失败，使用 LLM 修复
    const prompt = `
      DSL 验证失败，错误信息：
      ${validation.errors.join("\n")}
      
      请修复以下 DSL，确保它符合 schema：
      ${JSON.stringify(dsl, null, 2)}
      
      返回修复后的完整 DSL JSON。
    `;

    try {
      const correctedJson = await llmProvider(prompt);
      const correctedDSL = JSON.parse(correctedJson);

      // 再次验证修复后的 DSL
      const correctedValidation = this.validateDSL(correctedDSL);

      return {
        valid: correctedValidation.valid,
        errors: correctedValidation.errors,
        correctedDSL: correctedValidation.valid ? correctedDSL : undefined,
      };
    } catch (error: any) {
      return {
        valid: false,
        errors: [...validation.errors, `LLM修复失败: ${error.message}`],
      };
    }
  }
}
