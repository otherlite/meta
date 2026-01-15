import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateTypeScript } from "core/codegen";
import { validateAndFixDSL } from "core/validate";
import { MCPContext } from "types/mcp";
import { createErrorResponse, createSuccessResponse } from "helpers/mcp";

export const codegenDSLMCP = {
  definition: {
    id: "codegen-dsl",
    name: "CodeGen DSL",
    version: "1.0.0",
    description: "Generate TypeScript code and MCP templates from DSL",
    operations: {
      generate: {
        name: "generate",
        description: "Generate TypeScript code from DSL",
        parameters: {
          dslPath: {
            type: "string",
            description: "Path to DSL.json file",
            required: true,
          },
          outputDir: {
            type: "string",
            description:
              "Output directory for generated files (defaults to DSL directory)",
            required: false,
          },
          generateMCPs: {
            type: "boolean",
            description: "Generate MCP template files",
            required: false,
            default: true,
          },
          format: {
            type: "string",
            description: "Output format (ts, js, both)",
            required: false,
            default: "ts",
          },
        },
      },
      generateMCPTemplates: {
        name: "generateMCPTemplates",
        description: "Generate only MCP template files",
        parameters: {
          dslPath: {
            type: "string",
            description: "Path to DSL.json file",
            required: true,
          },
          outputDir: {
            type: "string",
            description: "Output directory for MCP templates",
            required: false,
          },
        },
      },
      generateTypes: {
        name: "generateTypes",
        description: "Generate TypeScript type definitions",
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
        case "generate": {
          const { dslPath, outputDir, generateMCPs, format } = parameters;

          if (!dslPath) {
            throw new Error("dslPath is required");
          }

          const fullPath = path.resolve(context.projectRoot, dslPath);
          logger?.info(`Loading DSL from: ${fullPath}`);

          const content = await readFile(fullPath, "utf-8");
          const dsl = JSON.parse(content);

          // Validate DSL first
          logger?.info("Validating DSL...");
          const validationResult = validateAndFixDSL(dsl);
          if (!validationResult.success) {
            return createErrorResponse("DSL validation failed", {
              errors: validationResult.errors,
              timestamp: new Date().toISOString(),
            });
          }

          const validDSL = validationResult.data!;

          // Determine output directory
          let finalOutputDir: string;
          if (outputDir) {
            finalOutputDir = path.resolve(context.projectRoot, outputDir);
          } else {
            finalOutputDir = path.dirname(fullPath);
          }

          // Create output directory
          await mkdir(finalOutputDir, { recursive: true });

          // Generate TypeScript code
          logger?.info("Generating TypeScript code...");
          const tsCode = generateTypeScript(validDSL);
          const tsPath = path.join(finalOutputDir, "dsl.ts");
          await writeFile(tsPath, tsCode);

          const generatedFiles = [{ path: tsPath, type: "typescript" }];

          // Generate JavaScript if requested
          if (format === "js" || format === "both") {
            const jsCode = this.convertTypeScriptToJavaScript(tsCode);
            const jsPath = path.join(finalOutputDir, "dsl.js");
            await writeFile(jsPath, jsCode);
            generatedFiles.push({ path: jsPath, type: "javascript" });
          }

          // Generate MCP templates if requested
          let mcpFiles: Array<{ path: string; type: string }> = [];
          if (generateMCPs) {
            logger?.info("Generating MCP templates...");
            mcpFiles = await this.generateMCPTemplates(
              validDSL,
              finalOutputDir
            );
            generatedFiles.push(...mcpFiles);
          }

          logger?.info(`Generated ${generatedFiles.length} files`);

          return createSuccessResponse(
            {
              dsl: validDSL,
              generatedFiles: generatedFiles.map((f) => ({
                path: path.relative(context.projectRoot, f.path),
                type: f.type,
              })),
              warnings: validationResult.warnings,
            },
            {
              format,
              generatedMCPs: generateMCPs,
              timestamp: new Date().toISOString(),
            }
          );
        }

        case "generateMCPTemplates": {
          const { dslPath, outputDir } = parameters;

          if (!dslPath) {
            throw new Error("dslPath is required");
          }

          const fullPath = path.resolve(context.projectRoot, dslPath);
          const content = await readFile(fullPath, "utf-8");
          const dsl = JSON.parse(content);

          // Determine output directory
          let finalOutputDir: string;
          if (outputDir) {
            finalOutputDir = path.resolve(context.projectRoot, outputDir);
          } else {
            finalOutputDir = path.dirname(fullPath);
          }

          const mcpFiles = await this.generateMCPTemplates(dsl, finalOutputDir);

          return createSuccessResponse(
            {
              generatedFiles: mcpFiles.map((f) => ({
                path: path.relative(context.projectRoot, f.path),
                type: f.type,
              })),
            },
            {
              timestamp: new Date().toISOString(),
            }
          );
        }

        case "generateTypes": {
          const { dslPath } = parameters;

          if (!dslPath) {
            throw new Error("dslPath is required");
          }

          const fullPath = path.resolve(context.projectRoot, dslPath);
          const content = await readFile(fullPath, "utf-8");
          const dsl = JSON.parse(content);

          const typeDefs = this.generateTypeDefinitions(dsl);

          return createSuccessResponse(
            {
              typeDefinitions: typeDefs,
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
        `Code generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return createErrorResponse(
        `Code generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { operation, timestamp: new Date().toISOString() }
      );
    }
  },

  convertTypeScriptToJavaScript(tsCode: string): string {
    // Simple conversion - remove TypeScript-specific syntax
    // In a real implementation, you would use the TypeScript compiler
    return tsCode
      .replace(/import.*from.*['"][^'"]+['"];?/g, "")
      .replace(/export /g, "")
      .replace(/:.*\?.*;/g, ";")
      .replace(/:.*;/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+\/\/.*$/gm, "")
      .replace(/^\s*$/gm, "")
      .trim();
  },

  async generateMCPTemplates(
    dsl: any,
    outputDir: string
  ): Promise<Array<{ path: string; type: string }>> {
    const generatedFiles: Array<{ path: string; type: string }> = [];
    const mcpTypes = new Set<string>();

    // Collect MCP types from components
    Object.values(dsl.view.components).forEach((component: any) => {
      if (component.type && component.type.endsWith("MCP")) {
        mcpTypes.add(component.type);
      }
    });

    // Collect MCP types from effects
    dsl.effects.forEach((effect: any) => {
      if (effect.action?.mcp) {
        mcpTypes.add(effect.action.mcp);
      }
    });

    // Create MCP directory
    const mcpDir = path.join(outputDir, "mcps");
    await mkdir(mcpDir, { recursive: true });

    // Generate template for each MCP type
    for (const mcpType of mcpTypes) {
      const mcpPath = path.join(mcpDir, `${mcpType}.ts`);

      try {
        // Check if file already exists
        await readFile(mcpPath, "utf-8");
        console.log(`MCP ${mcpType} already exists, skipping...`);
      } catch {
        // File doesn't exist, create template
        const template = this.generateMCPTemplate(mcpType);
        await writeFile(mcpPath, template);
        generatedFiles.push({ path: mcpPath, type: "mcp-template" });
      }
    }

    return generatedFiles;
  },

  generateMCPTemplate(mcpType: string): string {
    const className = mcpType.replace(/MCP$/i, "");

    return `// Auto-generated MCP template for ${mcpType}
// This file was generated by promptcc codegen-dsl MCP

import { LocalMCP, MCPContext } from 'promptcc';

export class ${className}MCP implements LocalMCP {
  definition = {
    id: '${mcpType.toLowerCase()}',
    name: '${className}',
    version: '1.0.0',
    description: 'Implementation of ${mcpType}',
    operations: {
      execute: {
        name: 'execute',
        description: 'Execute ${className} operation',
        parameters: {
          // Define your parameters here
          input: {
            type: 'any',
            description: 'Input data',
            required: true
          }
        }
      }
    }
  };

  async execute(operation: string, parameters: Record<string, any>, context: MCPContext) {
    context.logger?.info(\`${className}MCP.execute: \${operation}\`, parameters);

    switch (operation) {
      case 'execute':
        // Implement your logic here
        return {
          success: true,
          data: { 
            message: \`${className} MCP executed with input: \${JSON.stringify(parameters.input)}\`,
            timestamp: new Date().toISOString()
          }
        };
      
      default:
        throw new Error(\`Unsupported operation: \${operation}\`);
    }
  }

  validate(request: any) {
    const errors: string[] = [];
    const operation = request.operation;
    const parameters = request.parameters || {};

    switch (operation) {
      case 'execute':
        if (!parameters.input) {
          errors.push('input is required');
        }
        break;
      default:
        errors.push(\`Unknown operation: \${operation}\`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export default ${className}MCP;
`;
  },

  generateTypeDefinitions(dsl: any): string {
    const stateTypes = dsl.states
      .map(
        (state: any) => `  ${state.id}: ${this.inferType(state.defaultValue)};`
      )
      .join("\n");

    const eventTypes = dsl.events
      .map((event: any) => `  ${event.id}: { type: '${event.id}' };`)
      .join("\n");

    return `// Auto-generated TypeScript definitions
// Generated from DSL: ${dsl.metadata?.name || "unknown"}

export interface AppState {
${stateTypes}
}

export interface AppEvents {
${eventTypes}
}

export type StateKey = keyof AppState;
export type EventKey = keyof AppEvents;

// Component Props Types
export interface ComponentProps {
${Object.values(dsl.view.components)
  .map(
    (component: any) =>
      `  ${component.id}: ${JSON.stringify(component.properties, null, 2)};`
  )
  .join("\n")}
}
`;
  },

  inferType(value: any): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return "any[]";
    if (typeof value === "object") return "Record<string, any>";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "any";
  },

  validate(request: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const operation = request.operation;
    const parameters = request.parameters || {};

    switch (operation) {
      case "generate":
      case "generateMCPTemplates":
      case "generateTypes":
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
