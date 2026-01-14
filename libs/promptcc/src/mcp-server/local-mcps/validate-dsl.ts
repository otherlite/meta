import { readFile, writeFile } from "fs/promises";
import path from "path";
import { LocalMCP, MCPContext } from "../types";
import { validateAndFixDSL, deepValidateDSL } from "../../core/validate";
import { createSuccessResponse, createErrorResponse } from "./index";

export const validateDSLMCP: LocalMCP = {
  definition: {
    id: "validate-dsl",
    name: "Validate DSL",
    version: "1.0.0",
    description: "Validate DSL.json against schema and fix common issues",
    operations: {
      validate: {
        name: "validate",
        description: "Validate DSL from file or object",
        parameters: {
          dslPath: {
            type: "string",
            description: "Path to DSL.json file (optional if dsl is provided)",
            required: false,
          },
          dsl: {
            type: "object",
            description: "DSL object (optional if dslPath is provided)",
            required: false,
          },
          strict: {
            type: "boolean",
            description: "Enable strict validation with additional checks",
            required: false,
            default: false,
          },
        },
      },
      validateAndFix: {
        name: "validateAndFix",
        description: "Validate DSL and fix common issues",
        parameters: {
          dslPath: {
            type: "string",
            description: "Path to DSL.json file",
            required: true,
          },
          writeBack: {
            type: "boolean",
            description: "Write fixed DSL back to file",
            required: false,
            default: false,
          },
        },
      },
      quickCheck: {
        name: "quickCheck",
        description: "Quick validation of DSL file",
        parameters: {
          dslPath: {
            type: "string",
            description: "Path to DSL.json file",
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
        case "validate": {
          const { dslPath, dsl: dslObject, strict } = parameters;

          let dsl: any;

          if (dslPath) {
            const fullPath = path.resolve(context.projectRoot, dslPath);
            logger?.info(`Loading DSL from: ${fullPath}`);
            const content = await readFile(fullPath, "utf-8");
            dsl = JSON.parse(content);
          } else if (dslObject) {
            dsl = dslObject;
          } else {
            throw new Error("Either dslPath or dsl must be provided");
          }

          logger?.info(`Validating DSL (strict mode: ${strict})...`);
          const result = strict ? deepValidateDSL(dsl) : validateAndFixDSL(dsl);

          if (!result.success) {
            return createErrorResponse("DSL validation failed", {
              errors: result.errors,
              strictMode: strict,
              timestamp: new Date().toISOString(),
            });
          }

          return createSuccessResponse(
            {
              valid: true,
              dsl: result.data,
              warnings: result.warnings,
            },
            {
              strictMode: strict,
              hasWarnings: !!(result.warnings && result.warnings.length > 0),
              timestamp: new Date().toISOString(),
            }
          );
        }

        case "validateAndFix": {
          const { dslPath, writeBack } = parameters;

          if (!dslPath) {
            throw new Error("dslPath is required");
          }

          const fullPath = path.resolve(context.projectRoot, dslPath);
          logger?.info(`Loading DSL for validation and fix: ${fullPath}`);

          const content = await readFile(fullPath, "utf-8");
          const dsl = JSON.parse(content);

          logger?.info("Validating and fixing DSL...");
          const result = validateAndFixDSL(dsl);

          if (!result.success) {
            return createErrorResponse("DSL validation failed", {
              errors: result.errors,
              timestamp: new Date().toISOString(),
            });
          }

          const needsFix = !!(result.warnings && result.warnings.length > 0);

          if (writeBack && result.data) {
            logger?.info("Writing fixed DSL back to file...");
            await writeFile(fullPath, JSON.stringify(result.data, null, 2));
          }

          return createSuccessResponse(
            {
              valid: true,
              needsFix,
              fixedDSL: writeBack ? result.data : undefined,
              warnings: result.warnings,
              filePath: fullPath,
            },
            {
              writeBack,
              timestamp: new Date().toISOString(),
            }
          );
        }

        case "quickCheck": {
          const { dslPath } = parameters;

          if (!dslPath) {
            throw new Error("dslPath is required");
          }

          const fullPath = path.resolve(context.projectRoot, dslPath);
          logger?.info(`Quick checking DSL: ${fullPath}`);

          try {
            const content = await readFile(fullPath, "utf-8");
            const dsl = JSON.parse(content);

            // Basic validation only
            const result = validateAndFixDSL(dsl);

            return createSuccessResponse(
              {
                valid: result.success,
                hasWarnings: !!(result.warnings && result.warnings.length > 0),
                fileExists: true,
                isJson: true,
              },
              {
                timestamp: new Date().toISOString(),
              }
            );
          } catch (error) {
            if (error instanceof SyntaxError) {
              return createErrorResponse("Invalid JSON file", {
                fileExists: true,
                isJson: false,
                timestamp: new Date().toISOString(),
              });
            }
            throw error;
          }
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      logger?.error(
        `DSL validation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return createErrorResponse(
        `DSL validation failed: ${
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
      case "validate":
        if (!parameters.dslPath && !parameters.dsl) {
          errors.push("Either dslPath or dsl must be provided");
        }
        break;
      case "validateAndFix":
      case "quickCheck":
        if (!parameters.dslPath) {
          errors.push("dslPath is required");
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
