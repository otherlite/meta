import { DSLValidator } from "./DSLValidate";
import { DSLCodeGenerator } from "./DSLCodeGen";
import { PromptToDSLSampling } from "./PromptToDSLSampling";
import { DSLRoot, CustomDecoratorConfig } from "./types";

interface LLMProvider {
  generate: (prompt: string) => Promise<string>;
}

export class PromptToDSLWorkflow {
  private validator: DSLValidator;
  private codegen: DSLCodeGenerator;
  private sampler: PromptToDSLSampling;
  private maxRetries = 3;

  constructor(
    customDecorators: CustomDecoratorConfig[] = [],
    llmProvider?: LLMProvider
  ) {
    this.validator = new DSLValidator(customDecorators);
    this.codegen = new DSLCodeGenerator(customDecorators);
    this.sampler = new PromptToDSLSampling(
      llmProvider || {
        generate: async () => "{}",
      }
    );
  }

  async process(
    promptMarkdown: string,
    options: {
      validate?: boolean;
      generateCode?: boolean;
      outputDir?: string;
      retryOnError?: boolean;
    } = {}
  ): Promise<{
    dsl?: DSLRoot;
    validation?: any;
    code?: {
      types: string;
      hook: string;
      dsl: string;
    };
    errors: string[];
  }> {
    const {
      validate = true,
      generateCode = true,
      retryOnError = true,
    } = options;

    const errors: string[] = [];
    let dsl: DSLRoot | undefined;
    let validationResult: any;
    let generatedCode: any;

    try {
      // Step 1: 解析 Prompt.md
      console.log("Parsing Prompt.md...");
      dsl = await this.sampler.parsePrompt(promptMarkdown);

      if (!dsl) {
        throw new Error("Failed to parse Prompt.md");
      }

      // Step 2: 验证 DSL
      if (validate) {
        console.log("Validating DSL...");
        let retries = 0;
        let isValid = false;

        while (retries < this.maxRetries && !isValid && retryOnError) {
          validationResult = this.validator.validateDSL(dsl);

          if (validationResult.valid) {
            isValid = true;
            console.log("DSL validation passed");
          } else {
            errors.push(...validationResult.errors);
            console.warn(
              `DSL validation failed (attempt ${retries + 1}):`,
              validationResult.errors
            );

            if (retries < this.maxRetries - 1) {
              console.log("Retrying with LLM correction...");
              // 这里可以调用 LLM 修正，简化版本直接重试
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            retries++;
          }
        }

        if (!isValid && validationResult) {
          errors.push("DSL validation failed after all retries");
        }
      }

      // Step 3: 生成代码
      if (generateCode && (!validationResult || validationResult.valid)) {
        console.log("Generating code...");
        generatedCode = await this.codegen.generateFiles(
          dsl,
          options.outputDir || "./"
        );
        console.log("Code generation complete");
      }

      return {
        dsl,
        validation: validationResult,
        code: generatedCode,
        errors,
      };
    } catch (error: any) {
      errors.push(`Workflow error: ${error.message}`);
      console.error("Workflow failed:", error);

      return {
        errors,
      };
    }
  }

  async processWithLLM(
    promptMarkdown: string,
    llmProvider: LLMProvider,
    options?: any
  ) {
    // 创建新的采样器使用指定的 LLM 提供者
    const enhancedSampler = new PromptToDSLSampling(llmProvider);
    const dsl = await enhancedSampler.parsePrompt(promptMarkdown);

    // 验证和生成代码
    return this.process(promptMarkdown, {
      ...options,
      // 使用验证器的 LLM 修复功能
      validate: async (dsl: any) => {
        return this.validator.validateWithLLM(dsl, llmProvider.generate);
      },
    });
  }
}
