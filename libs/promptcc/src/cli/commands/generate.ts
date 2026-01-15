import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { validateAndFixDSL } from "core/validate";
import { generateTypeScript } from "core/codegen";
import { promptToDSL } from "core/prompt-parser";
import chalk from "chalk";
import { CommandModule } from "yargs";

export async function handler(argv: any) {
  const inputPath = path.resolve(argv.input);
  const outputDir = path.resolve(argv.output);
  const useLLM = argv.llm;

  console.log(chalk.blue(`Generating DSL from: ${inputPath}`));
  console.log(chalk.blue(`Output directory: ${outputDir}`));
  console.log(chalk.blue(`Using LLM: ${useLLM ? "Yes" : "No"}`));

  try {
    // 读取 Prompt.md 文件
    const promptContent = await readFile(inputPath, "utf-8");

    let dsl: any;

    if (useLLM) {
      // 使用 LLM 生成 DSL
      console.log(chalk.yellow("Calling LLM to generate DSL..."));

      // 这里应该集成 AI 服务
      // 暂时使用本地解析器作为替代
      console.log(
        chalk.yellow("LLM not yet implemented, using local parser instead...")
      );
      dsl = promptToDSL(promptContent);
    } else {
      // 使用本地解析器
      console.log(chalk.yellow("Using local parser to generate DSL..."));
      dsl = promptToDSL(promptContent);
    }

    // 验证和修复 DSL
    console.log(chalk.yellow("Validating DSL..."));
    const validationResult = validateAndFixDSL(dsl);

    if (!validationResult.success) {
      console.error(chalk.red("DSL validation failed:"));
      validationResult.errors?.forEach((error) =>
        console.error(chalk.red(`  ❌ ${error}`))
      );
      process.exit(1);
    }

    if (validationResult.warnings) {
      console.warn(chalk.yellow("DSL validation warnings:"));
      validationResult.warnings.forEach((warning) =>
        console.warn(chalk.yellow(`  ⚠️ ${warning}`))
      );
    }

    // 创建输出目录
    await mkdir(outputDir, { recursive: true });

    // 生成 JSON 文件
    const jsonPath = path.join(outputDir, "dsl.json");
    await writeFile(jsonPath, JSON.stringify(validationResult.data, null, 2));
    console.log(chalk.green(`✅ DSL JSON saved to: ${jsonPath}`));

    // 生成 TypeScript 文件
    const tsCode = generateTypeScript(validationResult.data!);
    const tsPath = path.join(outputDir, "dsl.ts");
    await writeFile(tsPath, tsCode);
    console.log(chalk.green(`✅ TypeScript code saved to: ${tsPath}`));

    // 生成页面 MCP 模板（如果不存在）
    const pageDir = path.dirname(inputPath);
    await generatePageMCPs(pageDir, validationResult.data!);

    console.log(chalk.green("✅ DSL generation completed successfully!"));
  } catch (error) {
    console.error(chalk.red("Failed to generate DSL:"), error);
    process.exit(1);
  }
}

async function generatePageMCPs(pageDir: string, dsl: any) {
  // 收集页面中使用的 MCP 类型
  const mcpTypes = new Set<string>();

  // 从组件中收集 MCP 类型
  Object.values(dsl.view.components).forEach((component: any) => {
    if (component.type && component.type.endsWith("MCP")) {
      mcpTypes.add(component.type);
    }
  });

  // 从效果中收集 MCP
  dsl.effects.forEach((effect: any) => {
    if (effect.action?.mcp) {
      mcpTypes.add(effect.action.mcp);
    }
  });

  // 创建 MCP 目录
  const mcpDir = path.join(pageDir, "mcps");
  await mkdir(mcpDir, { recursive: true });

  // 为每个 MCP 类型生成模板
  for (const mcpType of mcpTypes) {
    const mcpPath = path.join(mcpDir, `${mcpType}.ts`);

    try {
      // 检查文件是否已存在
      await readFile(mcpPath, "utf-8");
      console.log(chalk.gray(`MCP ${mcpType} already exists, skipping...`));
    } catch {
      // 文件不存在，创建模板
      const className = mcpType.replace(/MCP$/i, "");
      const template = `// ${mcpType} implementation
export default class ${className}MCP {
  async execute(operation: string, parameters: Record<string, any>) {
    // TODO: Implement ${mcpType} operations
    switch (operation) {
      case 'default':
        throw new Error(\`Operation \${operation} not implemented for ${mcpType}\`);
      default:
        throw new Error(\`Unknown operation: \${operation}\`);
    }
  }
  
  getSchema() {
    return {
      id: '${mcpType.toLowerCase()}',
      name: '${mcpType}',
      description: 'Auto-generated MCP for ${mcpType}',
      operations: {
        default: {
          description: 'Default operation',
          parameters: {},
          returns: { type: 'any' }
        }
      }
    };
  }
}
`;
      await writeFile(mcpPath, template);
      console.log(chalk.green(`✅ Created MCP template: ${mcpPath}`));
    }
  }
}

export const generateCommand: CommandModule<
  {},
  { input: string; output?: string; llm?: boolean }
> = {
  command: "generate <input>",
  describe: "Generate DSL from Prompt.md",

  builder: (yargs) =>
    yargs
      .positional("input", {
        describe: "Path to Prompt.md file",
        type: "string",
        demandOption: true,
      })
      .option("output", {
        describe: "Output directory for DSL files",
        default: ".",
        type: "string",
      })
      .option("llm", {
        describe: "Use LLM to generate DSL",
        default: false,
        type: "boolean",
      }),

  handler,
};
