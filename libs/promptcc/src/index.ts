export { PromptToDSLWorkflow } from "./PromptToDSLWorkflow";
export { DSLValidator } from "./DSLValidate";
export { DSLCodeGenerator } from "./DSLCodeGen";
export { PromptToDSLSampling } from "./PromptToDSLSampling";
export { PromptCCMCPServer } from "./McpServer";

// 类型导出
export type {
  DSLRoot,
  DSLNode,
  DecoratorType,
  DecoratorParam,
  CustomDecoratorConfig,
  UIComponent,
} from "./types";

// CLI 接口
import { Command } from "commander";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";
import { PromptToDSLWorkflow } from "./PromptToDSLWorkflow";
import chalk from "chalk";
import ora from "ora";

const program = new Command();

program
  .name("promptcc")
  .description("AI DSL Compiler for React + Jotai")
  .version("0.1.0");

program
  .command("compile <input>")
  .description("Compile Prompt.md to DSL and code")
  .option("-o, --output <dir>", "Output directory", "./generated")
  .option("--no-validate", "Skip validation")
  .option("--no-codegen", "Skip code generation")
  .option("--llm <provider>", "LLM provider (openai, anthropic, etc)")
  .option("--api-key <key>", "LLM API key")
  .action(async (input, options) => {
    const spinner = ora("Compiling...").start();

    try {
      // 读取输入文件
      const promptContent = readFileSync(input, "utf-8");

      // 创建输出目录
      if (!existsSync(options.output)) {
        mkdirSync(options.output, { recursive: true });
      }

      // 初始化工作流
      let llmProvider;
      if (options.llm && options.apiKey) {
        // 这里可以集成具体的 LLM 提供者
        llmProvider = {
          generate: async (prompt: string) => {
            // 简化版本，实际应该调用真正的 LLM API
            return JSON.stringify({});
          },
        };
      }

      const workflow = new PromptToDSLWorkflow([], llmProvider);

      // 处理
      const result = await workflow.process(promptContent, {
        validate: options.validate,
        generateCode: options.codegen,
        outputDir: options.output,
      });

      if (result.errors.length > 0) {
        spinner.fail("Compilation failed");
        console.error(chalk.red("Errors:"));
        result.errors.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
      }

      // 写入文件
      if (result.dsl) {
        writeFileSync(
          `${options.output}/dsl.json`,
          JSON.stringify(result.dsl, null, 2)
        );
      }

      if (result.code) {
        writeFileSync(`${options.output}/types.ts`, result.code.types);
        writeFileSync(`${options.output}/useDSL.tsx`, result.code.hook);
        writeFileSync(`${options.output}/dsl.raw.json`, result.code.dsl);
      }

      spinner.succeed("Compilation complete!");
      console.log(chalk.green(`Output written to: ${options.output}`));
    } catch (error: any) {
      spinner.fail("Compilation failed");
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("validate <dsl-file>")
  .description("Validate DSL JSON file")
  .action(async (dslFile) => {
    const spinner = ora("Validating...").start();

    try {
      const dslContent = readFileSync(dslFile, "utf-8");
      const dsl = JSON.parse(dslContent);

      const validator = new DSLValidator();
      const result = validator.validateDSL(dsl);

      if (result.valid) {
        spinner.succeed("DSL is valid!");
      } else {
        spinner.fail("DSL validation failed");
        console.error(chalk.red("Errors:"));
        result.errors.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
      }
    } catch (error: any) {
      spinner.fail("Validation failed");
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("serve")
  .description("Start MCP server")
  .action(() => {
    const { PromptCCMCPServer } = require("./McpServer");
    const server = new PromptCCMCPServer();
    server.run().catch(console.error);
  });

export function runCLI() {
  program.parse(process.argv);
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI();
}
