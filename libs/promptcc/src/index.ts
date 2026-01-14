import { createLocalMCPServer } from "./mcp-server";
import path from "path";

// Core exports
export * from "./core/validate";
export * from "./core/prompt-parser";
export * from "./core/codegen";
export * from "./core/jsonlogic";

export * from "./mcp-server";

// Types exports
export * from "./types";

// CLI exports (for programmatic use)
export { createLocalMCPServer } from "./mcp-server";
export { generateDSLFromPrompt, validateDSL, generateCode } from "./mcp-client";

// Main function for programmatic use
export async function processPrompt(
  promptPath: string,
  options?: {
    outputDir?: string;
    useAI?: boolean;
    generateMCPs?: boolean;
  }
) {
  const server = await createLocalMCPServer();

  // Generate DSL
  const generateResult = await server.execute({
    mcp: "dsl-workflow",
    operation: "generateFromPrompt",
    parameters: {
      promptPath,
      outputPath: options?.outputDir
        ? path.join(options.outputDir, "dsl.json")
        : undefined,
      useAI: options?.useAI || false,
    },
  });

  if (!generateResult.success) {
    throw new Error(`Failed to generate DSL: ${generateResult.error}`);
  }

  // Validate DSL
  const validateResult = await server.execute({
    mcp: "validate-dsl",
    operation: "validate",
    parameters: {
      dslPath: generateResult.data.outputPath,
    },
  });

  if (!validateResult.success) {
    throw new Error(`DSL validation failed: ${validateResult.error}`);
  }

  // Generate code
  const codegenResult = await server.execute({
    mcp: "codegen-dsl",
    operation: "generate",
    parameters: {
      dslPath: generateResult.data.outputPath,
      outputDir: options?.outputDir,
      generateMCPs: options?.generateMCPs !== false,
    },
  });

  if (!codegenResult.success) {
    throw new Error(`Code generation failed: ${codegenResult.error}`);
  }

  return {
    dsl: generateResult.data.dsl,
    validation: validateResult.data,
    codegen: codegenResult.data,
    files: {
      dslJson: generateResult.data.outputPath,
      generatedFiles: codegenResult.data.generatedFiles,
    },
  };
}

// Default export for convenience
export default {
  processPrompt,
  createLocalMCPServer,
};
