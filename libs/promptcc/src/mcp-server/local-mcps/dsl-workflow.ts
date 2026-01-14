import { readFile, writeFile } from "fs/promises";
import path from "path";
import { LocalMCP, MCPContext } from "../types";
import { promptToDSL } from "../../core/prompt-parser";
import { createSuccessResponse, createErrorResponse } from "./index";

export const dslWorkflowMCP: LocalMCP = {
  definition: {
    id: "dsl-workflow",
    name: "DSL Workflow",
    version: "1.0.0",
    description: "Convert Prompt.md to DSL.json using local parser or AI",
    operations: {
      generateFromPrompt: {
        name: "generateFromPrompt",
        description: "Generate DSL from Prompt.md file",
        parameters: {
          promptPath: {
            type: "string",
            description: "Path to Prompt.md file (relative to project root)",
            required: true,
          },
          outputPath: {
            type: "string",
            description:
              "Output path for DSL.json (optional, defaults to same directory)",
            required: false,
          },
          useAI: {
            type: "boolean",
            description:
              "Use AI for generation (requires AI client in context)",
            required: false,
            default: false,
          },
        },
      },
      parsePrompt: {
        name: "parsePrompt",
        description: "Parse Prompt.md content string to DSL",
        parameters: {
          content: {
            type: "string",
            description: "Prompt.md content",
            required: true,
          },
        },
      },
    },
  },

  async execute(
    operation: string,
    parameters: Record<string, any>,
    context: MCPContext
  ): Promise<any> {
    const logger = context.logger;

    try {
      switch (operation) {
        case "generateFromPrompt": {
          const { promptPath, outputPath, useAI } = parameters;

          if (!promptPath) {
            throw new Error("promptPath is required");
          }

          const fullPath = path.resolve(context.projectRoot, promptPath);
          logger?.info(`Reading Prompt.md from: ${fullPath}`);

          // Read Prompt.md
          const promptContent = await readFile(fullPath, "utf-8");

          let dsl: any;

          if (useAI) {
            if (!context.aiClient) {
              throw new Error(
                "AI client not available in context. Set aiClient or use useAI: false"
              );
            }

            logger?.info("Using AI to generate DSL...");
            // This would be implemented when we add AI integration
            throw new Error(
              "AI generation not yet implemented. Please use local parser for now."
            );
          } else {
            logger?.info("Using local parser to generate DSL...");
            dsl = promptToDSL(promptContent);
          }

          // Determine output path
          let finalOutputPath: string;
          if (outputPath) {
            finalOutputPath = path.resolve(context.projectRoot, outputPath);
          } else {
            const dir = path.dirname(fullPath);
            finalOutputPath = path.join(dir, "dsl.json");
          }

          // Ensure output directory exists
          await writeFile(finalOutputPath, JSON.stringify(dsl, null, 2));

          logger?.info(`DSL generated successfully: ${finalOutputPath}`);

          return createSuccessResponse(
            {
              dsl,
              outputPath: finalOutputPath,
              promptLength: promptContent.length,
              generatedFrom: useAI ? "ai" : "local-parser",
            },
            {
              timestamp: new Date().toISOString(),
            }
          );
        }

        case "parsePrompt": {
          const { content } = parameters;

          if (!content) {
            throw new Error("content is required");
          }

          const dsl = promptToDSL(content);

          return createSuccessResponse(
            {
              dsl,
              contentLength: content.length,
            },
            {
              timestamp: new Date().toISOString(),
            }
          );
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      logger?.error(
        `DSL workflow failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return createErrorResponse(
        `DSL workflow failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { operation, timestamp: new Date().toISOString() }
      );
    }
  },

  validate(request: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const operation = request.operation;
    const parameters = request.parameters || {};

    switch (operation) {
      case "generateFromPrompt":
        if (!parameters.promptPath) {
          errors.push("promptPath is required");
        }
        break;
      case "parsePrompt":
        if (!parameters.content) {
          errors.push("content is required");
        }
        break;
      default:
        errors.push(`Unknown operation: ${operation}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
};
