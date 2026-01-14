import { createLocalMCPServer, LocalMCPServer, MCPRequest } from "./mcp-server";
import path from "path";

let serverInstance: LocalMCPServer | null = null;

export async function getMCPServer(): Promise<LocalMCPServer> {
  if (!serverInstance) {
    serverInstance = await createLocalMCPServer();
  }
  return serverInstance;
}

export async function executeMCP(request: MCPRequest): Promise<any> {
  const server = await getMCPServer();
  return server.execute(request);
}

export async function batchExecuteMCP(requests: MCPRequest[]): Promise<any[]> {
  const server = await getMCPServer();
  return server.batchExecute(requests);
}

export async function listMCPs(): Promise<any[]> {
  const server = await getMCPServer();
  return server.listMCPs();
}

// Convenience functions for common operations
export async function generateDSLFromPrompt(
  promptPath: string,
  options?: { outputPath?: string; useAI?: boolean }
): Promise<any> {
  return executeMCP({
    mcp: "dsl-workflow",
    operation: "generateFromPrompt",
    parameters: {
      promptPath,
      outputPath: options?.outputPath,
      useAI: options?.useAI || false,
    },
  });
}

export async function validateDSL(
  dslPath: string,
  options?: { strict?: boolean }
): Promise<any> {
  return executeMCP({
    mcp: "validate-dsl",
    operation: "validate",
    parameters: {
      dslPath,
      strict: options?.strict || false,
    },
  });
}

export async function generateCode(
  dslPath: string,
  options?: { outputDir?: string; generateMCPs?: boolean; format?: string }
): Promise<any> {
  return executeMCP({
    mcp: "codegen-dsl",
    operation: "generate",
    parameters: {
      dslPath,
      outputDir: options?.outputDir,
      generateMCPs: options?.generateMCPs !== false,
      format: options?.format || "ts",
    },
  });
}

export async function generateMCPTemplates(
  dslPath: string,
  outputDir?: string
): Promise<any> {
  return executeMCP({
    mcp: "codegen-dsl",
    operation: "generateMCPTemplates",
    parameters: {
      dslPath,
      outputDir,
    },
  });
}
